import { ethers } from 'ethers';

const icpOracleAddress = '0x84227a76a04289473057bef706646199d7c58c34';

const CHAINLINK_ORACLE_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'latestAnswer',
    outputs: [
      {
        name: '',
        type: 'int256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'latestTimestamp',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

const providerPoket = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_POCKET_NETWORK_ID);

export const icpPrice = async () => {
  let price: number;
  const ethOracle = new ethers.Contract(icpOracleAddress, CHAINLINK_ORACLE_ABI, providerPoket);

  try {
    price = await ethOracle.latestAnswer();
    return price.toString();
  } catch (err) {
  }
  return '';
};
