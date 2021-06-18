import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useMulticallContract } from './useContract'
import ERC20_INTERFACE from '../constants/abis/erc20'
import priceContracts from '../constants/eggPriceContracts'

type ApiResponse = {
  prices: {
    [key: string]: string
  }
  update_at: string
}

/**
 * Due to Cors the api was forked and a proxy was created
 * @see https://github.com/pancakeswap/gatsby-pancake-api/commit/e811b67a43ccc41edd4a0fa1ee704b2f510aa0ba
 */
const api = 'https://api.pancakeswap.com/api/v1/price'

const useGetPriceData = () => {
  const [data, setData] = useState<number>(0)

  const multicallContract = useMulticallContract();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(multicallContract){
          const {cakeAddress, busdAddress, lpAddress, bnbAddress, lpBNBBUSD} = priceContracts;
          const calls = [
            [cakeAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [lpAddress])],
            [bnbAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [lpAddress])],
          ];

          console.log('alex =============');
          const [resultsBlockNumber, result] = await multicallContract.aggregate(calls);
          const [cakeAmount, busdAmount] = result.map(r=>ERC20_INTERFACE.decodeFunctionResult("balanceOf", r));
          const cake = new BigNumber(cakeAmount);
          const busd = new BigNumber(busdAmount);
          const cakePrice = busd.div(cake).div(10**9).toNumber();
          console.log('alex: cakeAmount: ', cake.toNumber());
          console.log('alex: busdAmount: ', busd.toNumber());
          console.log('alex: cakePrice', cakePrice);
          
          const calls1 = [
            [bnbAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [lpBNBBUSD])],
            [busdAddress, ERC20_INTERFACE.encodeFunctionData("balanceOf", [lpBNBBUSD])],
          ];

          const [resultsBlockNumber1, result1] = await multicallContract.aggregate(calls1);
          const [cakeAmount1, busdAmount1] = result1.map(r=>ERC20_INTERFACE.decodeFunctionResult("balanceOf", r));
          const cake1 = new BigNumber(cakeAmount1);
          const busd1 = new BigNumber(busdAmount1);
          const cakePrice1 = busd1.div(cake1).toNumber();
          console.log('alex =', cake1);
          console.log('alex =', busd1);
          console.log('alex =', cakePrice1);

          setData(cakePrice1 * cakePrice)
        }
      } catch (error) {
        console.error('Unable to fetch price data:', error)
      }
    }

    fetchData()
  }, [multicallContract])

  return data
}

export default useGetPriceData
