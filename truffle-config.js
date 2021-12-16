module.exports = {
  networks: {
    development: {
      host: "192.168.0.36",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 5000000
    }
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './abis/',
  compilers: {
    solc: {
      version: "0.8.10",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};