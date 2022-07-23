import { abi, contractAddresses } from "../constants"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][contractAddresses[chainId].length - 1] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0x")

    const dispatch = useNotification()

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
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
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

        const recentWinnerFromCall = await getRecentWinner()
        setRecentWinner(recentWinnerFromCall)
        console.log(`recentWinnerFromCall = ${recentWinnerFromCall}`)

        const numberOfPlayersFromCall = await getNumberOfPlayers()
        setNumberOfPlayers(numberOfPlayersFromCall)
        console.log(`numberOfPlayersFromCall = ${numberOfPlayersFromCall}`)
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async (tx) => {
        //
        await tx.wait(1)
        handleNewNotification(tx)
        updateUIValues()
    }
    const handleNewNotification = (tx) => {
        dispatch({
            type: "info",
            message: "Transaction success!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }
    return (
        <div className="p-5 ">
            Hi from Lottery Entrance
            {raffleAddress ? (
                <div className="">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (err) => {
                                    console.log(err)
                                },
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Number Of Players: {numberOfPlayers ? numberOfPlayers.toString() : "0"} Addresses</div>
                    <div>Entrance Fee: {entranceFee ? ethers.utils.formatUnits(entranceFee, "ether") : "0"} ETH</div>
                    <div>
                        Recent Winner:{" "}
                        {recentWinner
                            ? recentWinner.slice(0, 6) + "..." + recentWinner.slice(recentWinner.length - 4)
                            : "0x"}
                    </div>
                </div>
            ) : (
                <div>No Raffle Address</div>
            )}
        </div>
    )
}
