module launchpad_addr::launchpad {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self, Table};

    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::primary_fungible_store;

    /// Only admin can update creator
    const EONLY_ADMIN_CAN_UPDATE_CREATOR: u64 = 1;
    /// Only admin can set pending admin
    const EONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 2;
    /// Sender is not pending admin
    const ENOT_PENDING_ADMIN: u64 = 3;
    /// Only admin can update mint fee collector
    const EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR: u64 = 4;
    /// Only admin or creator can create fungible asset
    const EONLY_ADMIN_OR_CREATOR_CAN_CREATE_FA: u64 = 5;
    /// No mint limit
    const ENO_MINT_LIMIT: u64 = 6;
    /// Mint limit reached
    const EMINT_LIMIT_REACHED: u64 = 7;
    /// Only admin can update mint enabled
    const EONLY_ADMIN_CAN_UPDATE_MINT_ENABLED: u64 = 8;
    /// Mint is disabled
    const EMINT_IS_DISABLED: u64 = 9;
    /// Cannot mint 0 amount
    const ECANNOT_MINT_ZERO: u64 = 10;

    /// Default to mint 0 amount to creator when creating FA
    const DEFAULT_PRE_MINT_AMOUNT: u64 = 0;
    /// Default mint fee per smallest unit of FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
    const DEFAULT_mint_fee_per_smallest_unit_of_fa: u64 = 0;

     /// Error codes
    // const STARTING_PRICE_IS_LESS: u64 = 0;
    const E_NOT_ENOUGH_TOKENS: u64 = 11;
    const ECANNOT_BET_ZERO: u64 = 12;

    #[event]
    struct CreateFAEvent has store, drop {
        creator_addr: address,
        fa_owner_obj: Object<FAOwnerObjConfig>,
        fa_obj: Object<Metadata>,
        max_supply: Option<u128>,
        name: String,
        symbol: String,
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        mint_fee_per_smallest_unit_of_fa: u64,
        pre_mint_amount: u64,
        mint_limit_per_addr: Option<u64>,
    }

    #[event]
    struct MintFAEvent has store, drop {
        fa_obj: Object<Metadata>,
        amount: u64,
        recipient_addr: address,
        total_mint_fee: u64,
    }

    /// Unique per FA
    /// We need this object to own the FA object instead of contract directly owns the FA object
    /// This helps us avoid address collision when we create multiple FAs with same name
    struct FAOwnerObjConfig has key {
        fa_obj: Object<Metadata>,
        extend_ref: ExtendRef,
    }

    /// Unique per FA
    struct FAController has key {
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef,
    }

    /// Unique per FA
    struct MintLimit has store {
        limit: u64,
        // key is minter address, value is how many tokens minter left to mint
        // e.g. mint limit is 3, minter has minted 2, mint balance should be 1
        mint_balance_tracker: Table<address, u64>,
    }

    /// Unique per FA
    struct FAConfig has key {
        // Mint fee per FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_smallest_unit_of_fa: u64,
        mint_limit: Option<MintLimit>,
        mint_enabled: bool,
        fa_owner_obj: Object<FAOwnerObjConfig>,
        extend_ref: ExtendRef,
    }

    /// Global per contract
    struct Registry has key {
        fa_objects: vector<Object<Metadata>>,
    }

    /// Global per contract
    struct Config has key {
        // creator can create FA
        creator_addr: address,
        // admin can set pending admin, accept admin, update mint fee collector, create FA and update creator
        admin_addr: address,
        pending_admin_addr: Option<address>,
        mint_fee_collector_addr: address,
    }

    // Global per contract
    // Generate signer to send reward from reward store and stake store to user
    struct FungibleStoreController has key {
        extend_ref: ExtendRef,
    }

    struct Lotts has store,key{
         // Fungible store to hold rewards
        players: vector<address>,
        winner: address,
        totalamount: u64,
        win_tracker: Table<address, u64>,
    }

    struct StakePool has key {
        reward_store: Object<FungibleStore>,
    }

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the moduelr under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Registry {
            fa_objects: vector::empty()
        });
        move_to(sender, Config {
            creator_addr: @initial_creator_addr,
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
            mint_fee_collector_addr: signer::address_of(sender),
        });
        move_to(sender, Lotts{
            totalamount: 0,
            players: vector::empty<address>(),
            winner: @0x0,
            win_tracker: table::new(),
        });
        let sender_addr = signer::address_of(sender);
        let fungible_store_constructor_ref = &object::create_object(sender_addr);
        move_to(sender, FungibleStoreController {
            extend_ref: object::generate_extend_ref(fungible_store_constructor_ref),
        });
    }

    // ================================= Entry Functions ================================= //

    /// Update creator address
    public entry fun update_creator(sender: &signer, new_creator: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_CREATOR);
        config.creator_addr = new_creator;
    }

    /// Set pending admin of the contract, then pending admin can call accept_admin to become admin
    public entry fun set_pending_admin(sender: &signer, new_admin: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin_addr = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(config.pending_admin_addr == option::some(sender_addr), ENOT_PENDING_ADMIN);
        config.admin_addr = sender_addr;
        config.pending_admin_addr = option::none();
    }

    /// Update mint fee collector address
    public entry fun update_mint_fee_collector(sender: &signer, new_mint_fee_collector: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR);
        config.mint_fee_collector_addr = new_mint_fee_collector;
    }

    /// Update mint enabled
    public entry fun update_mint_enabled(sender: &signer, fa_obj: Object<Metadata>, enabled: bool) acquires Config, FAConfig{
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_MINT_ENABLED);
        let fa_obj_addr = object::object_address(&fa_obj);
        let fa_config = borrow_global_mut<FAConfig>(fa_obj_addr);
        fa_config.mint_enabled = enabled;
    }

    /// Create a fungible asset, only admin or creator can create FA
    public entry fun create_fa(
        sender: &signer,
        max_supply: Option<u128>,
        name: String,
        symbol: String,
        // Number of decimal places, i.e. APT has 8 decimal places, so decimals = 8, 1 APT = 1e-8 oapt
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        // Mint fee per smallest unit of FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_smallest_unit_of_fa: Option<u64>,
        // Amount in smallest unit of FA
        pre_mint_amount: Option<u64>,
        // Limit of minting per address in smallest unit of FA
        mint_limit_per_addr: Option<u64>,
    ) acquires Registry, Config, FAController ,FungibleStoreController{
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr) || is_creator(config, sender_addr), EONLY_ADMIN_OR_CREATOR_CAN_CREATE_FA);

        let fa_owner_obj_constructor_ref = &object::create_object(@launchpad_addr);
        let fa_owner_obj_signer = &object::generate_signer(fa_owner_obj_constructor_ref);

        let fa_obj_constructor_ref = &object::create_named_object(
            fa_owner_obj_signer,
            *string::bytes(&name),
        );
        let fa_obj_signer = &object::generate_signer(fa_obj_constructor_ref);

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri
        );
        let fa_obj = object::object_from_constructor_ref(fa_obj_constructor_ref);
        move_to(fa_owner_obj_signer, FAOwnerObjConfig {
            fa_obj,
            extend_ref: object::generate_extend_ref(fa_owner_obj_constructor_ref),
        });
        let fa_owner_obj = object::object_from_constructor_ref(fa_owner_obj_constructor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(fa_obj_constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(fa_obj_constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(fa_obj_constructor_ref);
        move_to(fa_obj_signer, FAController {
            mint_ref,
            burn_ref,
            transfer_ref,
        });
        move_to(fa_obj_signer, FAConfig {
            mint_fee_per_smallest_unit_of_fa: *option::borrow_with_default(
                &mint_fee_per_smallest_unit_of_fa,
                &DEFAULT_mint_fee_per_smallest_unit_of_fa
            ),
            mint_limit: if (option::is_some(&mint_limit_per_addr)) {
                option::some(MintLimit {
                    limit: *option::borrow(&mint_limit_per_addr),
                    mint_balance_tracker: table::new()
                })
            } else {
                option::none()
            },
            mint_enabled: true,
            extend_ref: object::generate_extend_ref(fa_obj_constructor_ref),
            fa_owner_obj,
        });

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        vector::push_back(&mut registry.fa_objects, fa_obj);

        event::emit(CreateFAEvent {
            creator_addr: sender_addr,
            fa_owner_obj,
            fa_obj,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri,
            mint_fee_per_smallest_unit_of_fa: *option::borrow_with_default(
                &mint_fee_per_smallest_unit_of_fa,
                &DEFAULT_mint_fee_per_smallest_unit_of_fa
            ),
            pre_mint_amount: *option::borrow_with_default(&pre_mint_amount, &DEFAULT_PRE_MINT_AMOUNT),
            mint_limit_per_addr,
        });

        if (*option::borrow_with_default(&pre_mint_amount, &DEFAULT_PRE_MINT_AMOUNT) > 0) {
            let amount = *option::borrow(&pre_mint_amount);
            mint_fa_internal(sender, fa_obj, amount, 0);
        };

       let store_signer = &generate_fungible_store_signer();
       let stake_store_object_constructor_ref = &object::create_object(signer::address_of(store_signer));

        move_to(sender, StakePool {
              reward_store: fungible_asset::create_store(
              stake_store_object_constructor_ref,
              fa_obj,
         ),
        });
    }

    /// Mint fungible asset, anyone with enough mint fee and has not reached mint limit can mint FA
    public entry fun mint_fa(
        sender: &signer,
        fa_obj: Object<Metadata>,
        amount: u64
    ) acquires FAController, FAConfig, Config {
        assert!(amount > 0, ECANNOT_MINT_ZERO);
        assert!(is_mint_enabled(fa_obj), EMINT_IS_DISABLED);
        let sender_addr = signer::address_of(sender);
        check_mint_limit_and_update_mint_tracker(sender_addr, fa_obj, amount);
        let total_mint_fee = get_mint_fee(fa_obj, amount);
        pay_for_mint(sender, total_mint_fee);
        mint_fa_internal(sender, fa_obj, amount, total_mint_fee);
    }

    // ================================= View Functions ================================== //

    #[view]
    /// Get creator, creator is the address that is allowed to create FAs
    public fun get_creator(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.creator_addr
    }

    #[view]
    /// Get contract admin
    public fun get_admin(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.admin_addr
    }

    #[view]
    /// Get contract pending admin
    public fun get_pending_admin(): Option<address> acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.pending_admin_addr
    }

    #[view]
    /// Get mint fee collector address
    public fun get_mint_fee_collector(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.mint_fee_collector_addr
    }

    #[view]
    /// Get all fungible assets created using this contract
    public fun get_registry(): vector<Object<Metadata>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.fa_objects
    }

    #[view]
    /// Get fungible asset metadata
    public fun get_fa_objects_metadatas(
        fa_obj: Object<Metadata>
    ): (String, String, u8) {
        let name = fungible_asset::name(fa_obj);
        let symbol = fungible_asset::symbol(fa_obj);
        let decimals = fungible_asset::decimals(fa_obj);
        (symbol, name, decimals)
    }

    #[view]
    /// Get mint limit per address
    public fun get_mint_limit(
        fa_obj: Object<Metadata>,
    ): Option<u64> acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        if (option::is_some(&fa_config.mint_limit)) {
            option::some(option::borrow(&fa_config.mint_limit).limit)
        } else {
            option::none()
        }
    }

    #[view]
    /// Get mint balance, i.e. how many tokens user can mint
    /// e.g. If the mint limit is 1, user has already minted 1, balance is 0
    public fun get_mint_balance(
        fa_obj: Object<Metadata>,
        addr: address
    ): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        assert!(option::is_some(&fa_config.mint_limit), ENO_MINT_LIMIT);
        let mint_limit = option::borrow(&fa_config.mint_limit);
        let mint_tracker = &mint_limit.mint_balance_tracker;
        *table::borrow_with_default(mint_tracker, addr, &mint_limit.limit)
    }

    #[view]
    /// Get mint fee denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
    public fun get_mint_fee(
        fa_obj: Object<Metadata>,
        // Amount in smallest unit of FA
        amount: u64,
    ): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        amount * fa_config.mint_fee_per_smallest_unit_of_fa
    }

    #[view]
    /// Is mint enabled for the fa
    public fun is_mint_enabled(fa_obj: Object<Metadata>): bool acquires FAConfig {
        let fa_addr = object::object_address(&fa_obj);
        let fa_config = borrow_global<FAConfig>(fa_addr);
        fa_config.mint_enabled
    }

    // ================================= Helper Functions ================================== //

    /// Check if sender is admin or owner of the object when package is published to object
    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin_addr) {
            true
        } else {
            if (object::is_object(@launchpad_addr)) {
                let obj = object::address_to_object<ObjectCore>(@launchpad_addr);
                object::is_owner(obj, sender)
            } else {
                false
            }
        }
    }

    /// Check if sender is allowed to create FA
    fun is_creator(config: &Config, sender: address): bool {
        sender == config.creator_addr
    }

    /// Check mint limit and update mint tracker
    fun check_mint_limit_and_update_mint_tracker(
        sender: address,
        fa_obj: Object<Metadata>,
        amount: u64,
    ) acquires FAConfig {
        let mint_limit = get_mint_limit(fa_obj);
        if (option::is_some(&mint_limit)) {
            let mint_balance = get_mint_balance(fa_obj, sender);
            assert!(
                mint_balance >= amount,
                EMINT_LIMIT_REACHED,
            );
            let fa_config = borrow_global_mut<FAConfig>(object::object_address(&fa_obj));
            let mint_limit = option::borrow_mut(&mut fa_config.mint_limit);
            table::upsert(&mut mint_limit.mint_balance_tracker, sender, mint_balance - amount)
        }
    }

    /// ACtual implementation of minting FA
    fun mint_fa_internal(
        sender: &signer,
        fa_obj: Object<Metadata>,
        amount: u64,
        total_mint_fee: u64,
    ) acquires FAController {
        let sender_addr = signer::address_of(sender);
        let fa_obj_addr = object::object_address(&fa_obj);

        let fa_controller = borrow_global<FAController>(fa_obj_addr);
        primary_fungible_store::mint(&fa_controller.mint_ref, sender_addr, amount);

        event::emit(MintFAEvent {
            fa_obj,
            amount,
            recipient_addr: sender_addr,
            total_mint_fee,
        });
    }

    /// Pay for mint
    fun pay_for_mint(
        sender: &signer,
        total_mint_fee: u64
    ) acquires Config {
        if (total_mint_fee > 0) {
            let config = borrow_global<Config>(@launchpad_addr);
            aptos_account::transfer(sender, config.mint_fee_collector_addr, total_mint_fee)
        }
    }


    public entry fun place_bet(
    from: &signer,
    to_address: address,
    fa_obj: Object<Metadata>,
    amount: u64
   ) acquires Lotts ,StakePool{
    let from_addr = signer::address_of(from);
    
    // Check if user has enough of the custom token
    let user_balance = primary_fungible_store::balance(from_addr, fa_obj);
    assert!(amount > 0, ECANNOT_BET_ZERO);
    assert!(amount <= user_balance, E_NOT_ENOUGH_TOKENS);
   
    let stake_pool_mut = borrow_global_mut<StakePool>(@initial_creator_addr);
    fungible_asset::transfer(
            from,
            primary_fungible_store::primary_store(from_addr, fa_obj),
            stake_pool_mut.reward_store,
            amount
    );
    
    // Update lottery data
    let bet_store = borrow_global_mut<Lotts>(to_address);
    vector::push_back(&mut bet_store.players, from_addr);
    bet_store.totalamount = bet_store.totalamount + amount;
   }

   public entry fun pickWinner(fa_obj: Object<Metadata>, winner_address:address,
    ) acquires Lotts , Config, FungibleStoreController,StakePool{
        let b_store = borrow_global_mut<Lotts>(@launchpad_addr);
        let total_players = vector::length(&b_store.players);
        let config = borrow_global<Config>(@launchpad_addr);
        let stake_pool = borrow_global<StakePool>(@initial_creator_addr);


       let winner_exists = false;
        
        let i = 0;
        while (i < total_players) {
            let player = *vector::borrow(&b_store.players, i);
            if (player == winner_address) {
                winner_exists = true;
                break;
            };
            i = i + 1;
        };

         assert!(winner_exists, 1); // Error code 1: Winner address not found in players list


        let amount:u64;
        // let _winner: address = @0x0; 
        // let better = *vector::borrow(&b_store.players, winner_index);
        // _winner = better;
        amount = b_store.totalamount;

          // Update the winner's win count
        if (table::contains(&b_store.win_tracker,winner_address)) {
           let current_wins = *table::borrow(&b_store.win_tracker, winner_address);
           table::upsert(&mut b_store.win_tracker, winner_address, current_wins + 1);
        } else {
           table::add(&mut b_store.win_tracker, winner_address, 1);
        };

         fungible_asset::transfer(
            &generate_fungible_store_signer(),
            stake_pool.reward_store,
            primary_fungible_store::ensure_primary_store_exists(winner_address, fa_obj),
            amount
        );

         // Clear players and reset totalamount after winner has been paid
        b_store.players = vector::empty<address>();   // Reset to a new empty vector
        b_store.totalamount = 0;                      // Reset the total amount to zero
    }


     fun generate_fungible_store_signer(): signer acquires FungibleStoreController {
        object::generate_signer_for_extending(&borrow_global<FungibleStoreController>(@launchpad_addr).extend_ref)
    }


     #[view]
    public fun getBalance():u64 acquires Lotts{
        let b_store = borrow_global_mut<Lotts>(@launchpad_addr);

        // assert_is_owner(addr);
        return b_store.totalamount
    }

    #[view]
    public fun allPlayers(store_addr: address):u64 acquires Lotts{
        let b_store = borrow_global_mut<Lotts>(store_addr);
        let total_players = vector::length(&b_store.players);
        return total_players
    }

   #[view]
   public fun get_win_count(store_addr: address, player_addr: address): u64 acquires Lotts {
    let b_store = borrow_global<Lotts>(store_addr);
    
    if (table::contains(&b_store.win_tracker, player_addr)) {
        *table::borrow(&b_store.win_tracker, player_addr)
    } else {
        0 // Return 0 if the player has never won
    }
}

    // ================================= Uint Tests ================================== //

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}
