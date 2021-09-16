const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {

  beforeEach(async () => {
    let deadline = 604800; // 1 week
    [admin, addr1, addr2, addr3] = await ethers.getSigners();
    CrowdFunding = await ethers.getContractFactory('CrowdFunding');
    crowdFunding = await CrowdFunding.deploy(
       ethers.utils.parseEther("0.5"), deadline, admin.address
    );
    deploymentBlockNum = (await ethers.provider.getBlockNumber());
  });

  describe('Deployment', async () => {

    it('Should set admin correctly', async () => {
      expect(await crowdFunding.admin()).to.be.equal(admin.address);
    });

    it('Should set deadline to one week', async () => {
      expect(
        await crowdFunding.deadline()
      ).to.be.equal(
        (await ethers.provider.getBlock(deploymentBlockNum)).timestamp + 604800
      );
    });

    it('Should set goal to 0.5 ether', async () => {
      expect(
        await crowdFunding.goal()
      ).to.be.equal(
        ethers.utils.parseEther('0.5')
      );
    });

  });

});
