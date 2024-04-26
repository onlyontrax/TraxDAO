// import axios from 'axios';

// const ID = "icp-internet-computer";
// const formatPrice= price => parseFloat(Number(price).toFixed(3));

// export const icpPrice = async ()=>{
// //     const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${ID}`)
// //    const coinIds = response.data.slice(0, COIN_COUNT).map(coin => coin.id);
// //    const tickerURL = "https://api.coinpaprika.com/v1/tickers/";
// //    const promise = await axios.get(`https://api.coinpaprika.com/v1/tickers/${ID}`)
// //    const coinData = await Promise.all(promise)
// //    const coinPriceData = coinData.map(function(response){
// //    const coin = response.data
// //     return {
// //       price: formatPrice(coin.quotes.USD.price)
// //      };
// //    })
// //    return coinPriceData;

//     const {data} = await axios.get(`https://api.coinpaprika.com/v1/tickers/${ID}`);
//     const priceData = data.map(function(response){
//         const coin = response.data;
//         return formatPrice(coin.quotes.USD.price)
//     })
//     return priceData;
//     //    setCoinData(coinPriceData);
// }

// function App(){
//   const [balance, setBalance] = useState(10000);
//   const [showBalance, setShowBalance] = useState(false);
//   const [coinData, setCoinData] = useState([]);

//  const componentDidMount = async () => {
//    const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${ID}`)
//    const coinIds = response.data.slice(0, COIN_COUNT).map(coin => coin.id);
//    const tickerURL = "https://api.coinpaprika.com/v1/tickers/";
//    const promises = coinIds.map(id => axios.get(tickerURL + id));
//    const coinData = await Promise.all(promises)
//    const coinPriceData = coinData.map(function(response){
//    const coin = response.data
//     return {
//       key: coin.id,
//       name: coin.name,
//       ticker: coin.symbol,
//       balance: 0,
//       price: formatPrice(coin.quotes.USD.price)
//      };
//    })
//        setCoinData(coinPriceData);
//    };

//   useEffect(() => {
//     if(coinData.length === 0){
//       componentDidMount()
//     }
//   });

//   const handleBrrrr = () => {
//     setBalance (oldBalance => oldBalance + 1200)
//   }

//   const handleBalanceVisibility = () => {
//     setShowBalance(oldValue => !oldValue);
//   }

//   const handleTransaction = (isBuy, valueChangeId) => {
//     var balanceChange = isBuy ? 1 : -1;
//     const newcoinData = coinData.map( function(values){
//       let newValues = { ...values };
//       if(valueChangeId === values.key){
//         newValues.balance += balanceChange;
//         setBalance( oldBalance => oldBalance - balanceChange * newValues.price)
//       }
//       return newValues;
//     })
//     setCoinData(newcoinData);
//   }

//   const handleRefresh = async (valueChangeId) => {
//       const ticketUrl = `https://api.coinpaprika.com/v1/tickers/${valueChangeId}`;
//       const response = await axios.get(ticketUrl);
//       const newPrice = formatPrice(response.data.quotes.USD.price);
//       const newCoinData = coinData.map(function(values) {
//         let newValues = {...values};
//         if(valueChangeId === values.key){
//           newValues.price = newPrice;
//         }
//         return newValues;
//       });
//        setCoinData(newCoinData)
//   }
// }

// export default App;
