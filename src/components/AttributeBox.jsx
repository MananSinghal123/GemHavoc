// AttributeBox.jsx - Custom component for attribute display
const AttributeBox = ({ label, value }) => (
  <div className="bg-gray-700 p-4 rounded-lg">
    <Text className="text-gray-300 mb-1">{label}</Text>
    <Text className="text-white text-lg">{value}</Text>
  </div>
);
