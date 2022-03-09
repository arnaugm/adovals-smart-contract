async function main() {
  const Adovals = await ethers.getContractFactory("Adovals")

  // Start deployment, returning a promise that resolves to a contract object
  const adovals = await Adovals.deploy()
  await adovals.deployed()
  console.log("Contract deployed to address:", adovals.address)
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error)
  process.exit(1)
})
