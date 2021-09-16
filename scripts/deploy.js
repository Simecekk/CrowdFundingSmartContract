const hre = require("hardhat");

async function main() {
  [admin, ] = await ethers.getSigners();
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  let deadline = 604800  // 1 week
  const crowdFunding = await CrowdFunding.deploy(
    ethers.utils.parseEther("1"), deadline, admin.address,
  );
  await crowdFunding.deployed();
  console.log("crowdFunding deployed to:", crowdFunding.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
