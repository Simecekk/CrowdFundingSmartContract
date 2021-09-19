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

    it('Should set min contribution to 100 wei', async () => {
      expect(
        await crowdFunding.minContribution()
      ).to.be.equal(
        100
      )
    });

  });

  describe('createRequest', async() => {
    it('Only admin should be able to create request', async() => {
      await expect(
        crowdFunding.connect(addr1).createRequest(
          'Request description',
          addr2.address,
          ethers.utils.parseEther('1')
        )
      ).to.be.revertedWith(
        'You have to be an admin'
      )
    });

    it('Should correctly create request', async() => {
      await crowdFunding.createRequest(
        'Request description',
        admin.address,
        ethers.utils.parseEther('1')
      );

      expect(await crowdFunding.numRequests()).to.be.equal(1);

      let request = await crowdFunding.requests(0);
      expect(request.description).to.be.equal('Request description');
      expect(request.recipient).to.be.equal(admin.address);
      expect(request.value.toString()).to.be.equal(ethers.utils.parseEther('1'));
      expect(request.completed).to.be.equal(false);
      expect(request.noOfVoters).to.be.equal(0);
    });
  });


});
