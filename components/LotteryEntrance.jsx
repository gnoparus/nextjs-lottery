import { abi, contractAddresses } from "../constants"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][contractAddresses[chainId].length - 1] : null
    const [entranceFee, setEntranceFee] = useState("0")

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee * 4,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    async function updateUIValues() {
        console.log("Entering updateUIValues")
        const entranceFeeFromCall = await getEntranceFee()
        setEntranceFee(entranceFeeFromCall)
        console.log(`entranceFeeFromCall = ${entranceFeeFromCall}`)
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            //

            updateUIValues()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            Hi from Lottery Entrance
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterRaffle()
                        }}
                    >
                        Enter Raffle
                    </button>
                    Entrance Fee: {entranceFee ? ethers.utils.formatUnits(entranceFee, "ether") : "0"} ETH
                </div>
            ) : (
                <div>No Raffle Address</div>
            )}
        </div>
    )
}
