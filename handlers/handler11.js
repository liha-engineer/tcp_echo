
const handler11 = (data) => {
    const processedData = data.toString().reverse()
    return Buffer.from(processedData)
}

export default handler11;