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

  describe('createRequest function', async() => {
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

    it('Should emit createRequestEvent', async() => {
      await expect(
        crowdFunding.createRequest(
          'Request description',
          admin.address,
          ethers.utils.parseEther('1')
        )
      ).to.emit(
        crowdFunding, 'createRequestEvent'
      ).withArgs(
        'Request description',
        admin.address,
        ethers.utils.parseEther('1')
      );
    });

  });

  describe('Contribute function', async() => {
    it('Contribution is only possible before deadline', async() => {
      await ethers.provider.send("evm_increaseTime", [704800])
      await expect(
        crowdFunding.contribute()
      ).to.be.revertedWith(
        'Deadline of campaign has passed'
      )
    });

    it('Requires at least minimum contribution', async() => {
      await expect(
        crowdFunding.contribute({value: 99})
      ).to.be.revertedWith(
        'Minimal ontribution is 100 wei'
      )
    });

    it('Should correctly contribute', async() => {
      await crowdFunding.contribute({value: 200});
      await crowdFunding.contribute({value: 300});

      expect(
        (await crowdFunding.contributors(admin.address)).toNumber()
      ).to.be.equal(
        500
      );

      expect(
        (await crowdFunding.raisedAmount()).toNumber()
      ).to.be.equal(
        500
      )

      expect(
        (await crowdFunding.noOfContributors()).toNumber()
      ).to.be.equal(
        1
      )
    });

    it('Should emit ContributeEvent', async() => {
      await expect(
        crowdFunding.contribute({value: 600})
      ).to.emit(
        crowdFunding, 'ContributeEvent'
      ).withArgs(
        admin.address, 600
      );
    });
  });
});
