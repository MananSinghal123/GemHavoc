#[test_only]
module launchpad_addr::test_end_to_end {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_framework::aptos_coin;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;

    use launchpad_addr::launchpad;

    // #[test(aptos_framework = @0x1, sender = @launchpad_addr)]
    // fun test_happy_path(
    //     aptos_framework: &signer,
    //     sender: &signer,
    // ) {
    //     let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

    //     let sender_addr = signer::address_of(sender);

    //     launchpad::init_module_for_test(sender);

    //     // create first FA

    //     launchpad::create_fa(
    //         sender,
    //         option::some(1000),
    //         string::utf8(b"FA1"),
    //         string::utf8(b"FA1"),
    //         2,
    //         string::utf8(b"icon_url"),
    //         string::utf8(b"project_url"),
    //         option::none(),
    //         option::none(),
    //         option::some(500)
    //     );
    //     let registry = launchpad::get_registry();
    //     let fa_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
    //     assert!(fungible_asset::supply(fa_1) == option::some(0), 1);

    //     launchpad::mint_fa(sender, fa_1, 20);
    //     assert!(fungible_asset::supply(fa_1) == option::some(20), 2);
    //     assert!(primary_fungible_store::balance(sender_addr, fa_1) == 20, 3);

    //     // create second FA

    //     launchpad::create_fa(
    //         sender,
    //         option::some(1000),
    //         string::utf8(b"FA2"),
    //         string::utf8(b"FA2"),
    //         3,
    //         string::utf8(b"icon_url"),
    //         string::utf8(b"project_url"),
    //         option::some(1),
    //         option::none(),
    //         option::some(500)
    //     );
    //     let registry = launchpad::get_registry();
    //     let fa_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
    //     assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

    //     account::create_account_for_test(sender_addr);
    //     coin::register<aptos_coin::AptosCoin>(sender);
    //     let mint_fee = launchpad::get_mint_fee(fa_2, 300);
    //     aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
    //     launchpad::mint_fa(sender, fa_2, 300);
    //     assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
    //     assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);

    //     coin::destroy_burn_cap(burn_cap);
    //     coin::destroy_mint_cap(mint_cap);
    // }

    // #[test(aptos_framework = @0x1, sender = @launchpad_addr)]
    // #[expected_failure(abort_code = 9, location = launchpad)]
    // fun test_mint_disabled(
    //     aptos_framework: &signer,
    //     sender: &signer,
    // ) {
    //     let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

    //     launchpad::init_module_for_test(sender);

    //     launchpad::create_fa(
    //         sender,
    //         option::some(1000),
    //         string::utf8(b"FA1"),
    //         string::utf8(b"FA1"),
    //         2,
    //         string::utf8(b"icon_url"),
    //         string::utf8(b"project_url"),
    //         option::none(),
    //         option::none(),
    //         option::some(500)
    //     );
    //     let registry = launchpad::get_registry();
    //     let fa_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
    //     assert!(launchpad::is_mint_enabled(fa_1), 1);

    //     launchpad::mint_fa(sender, fa_1, 20);

    //     launchpad::update_mint_enabled(sender, fa_1, false);
    //     assert!(!launchpad::is_mint_enabled(fa_1), 2);

    //     launchpad::mint_fa(sender, fa_1, 20);

    //     coin::destroy_burn_cap(burn_cap);
    //     coin::destroy_mint_cap(mint_cap);
    // }


    #[test(admin = @launchpad_addr,aptos_framework = @0x1, sender = @0x1,sender2=@0x2,initial_creator=@initial_creator_addr)]
      fun test_flow(admin: signer , aptos_framework: &signer,sender: &signer,sender2: &signer,initial_creator: &signer) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let sender_addr = signer::address_of(sender);
        let sender2_addr = signer::address_of(sender2);

        launchpad::init_module_for_test(&admin);

        // create first FA

        launchpad::create_fa(
            initial_creator,
            option::some(1000),
            string::utf8(b"FA2"),
            string::utf8(b"FA2"),
            3,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            option::some(1),
            option::none(),
            option::some(500)
        );
        let registry = launchpad::get_registry();
        let fa_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

        account::create_account_for_test(sender_addr);
        coin::register<aptos_coin::AptosCoin>(sender);
        let mint_fee = launchpad::get_mint_fee(fa_2, 300);
        aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
        launchpad::mint_fa(sender, fa_2, 30);


        account::create_account_for_test(sender2_addr);
        coin::register<aptos_coin::AptosCoin>(sender2);
        let mint_fee = launchpad::get_mint_fee(fa_2, 300);
        aptos_coin::mint(aptos_framework, sender2_addr, mint_fee);
        launchpad::mint_fa(sender2, fa_2, 30);


        // assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
        // assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);


        let owner = signer::address_of(&admin);
        // let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        let aptos_framework_address = signer::address_of(aptos_framework);
        account::create_account_for_test(aptos_framework_address);


        let bet = account::create_account_for_test(sender_addr);
        let bet2 = account::create_account_for_test(sender2_addr);



        launchpad::place_bet(&bet,owner,fa_2, 2);
        launchpad::place_bet(&bet2,owner,fa_2, 3);
       
        launchpad::pickWinner(fa_2,sender2_addr);


        let totalPlayers = launchpad::allPlayers(owner);
        let winCount=launchpad::get_win_count(owner,sender2_addr);
        let balance = launchpad::getBalance();

        assert!(totalPlayers == 0,0);
        assert!(winCount == 1 ,0);
        assert!(balance == 0,0);

      }
}
