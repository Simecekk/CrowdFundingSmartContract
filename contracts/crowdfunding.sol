//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.0 < 0.9.0;

contract CrowdFunding {
  mapping(address => uint) public contributors;
  address public admin;
  uint public noOfContributors;
  uint public minContribution;
  uint public deadline; // timestamp
  uint public goal;
  uint public raisedAmount;
  struct Request{
    string description;
    address payable recipient;
    uint value;
    bool completed;
    uint noOfVoters;
    mapping(address => bool) voters;
  }
  mapping(uint => Request) public requests;
  uint public  numRequests;

  event ContributeEvent(address _sender, uint _value);
  event createRequestEvent(string _description, address _recipient, uint _value);
  event MakePaymentEvent(address _recipient, uint _value);

  constructor(uint _goal, uint _deadline, address _admin) {
    goal = _goal;
    deadline = block.timestamp + _deadline;
    minContribution = 100;
    admin = _admin;
  }

  modifier onlyAdmin(){
    require(msg.sender == admin, "You have to be an admin");
    _;
  }

  function goalHasBeenReached() public view returns(bool) {
    return raisedAmount >= goal;
  }

  function createRequest(
    string memory _description,
    address payable _recipient,
    uint _value
  ) public onlyAdmin {
      Request storage newRequest = requests[numRequests];
      numRequests++;

      newRequest.description = _description;
      newRequest.recipient = _recipient;
      newRequest.value = _value;
      newRequest.completed = false;
      newRequest.noOfVoters = 0;

      emit createRequestEvent(_description, _recipient, _value);
  }

  function contribute() public payable {
    require(block.timestamp < deadline, "Deadline of campaign has passed");
    require(msg.value >= minContribution, "Minimal ontribution is 100 wei");

    if(contributors[msg.sender] == 0){
      noOfContributors++;
    }

    contributors[msg.sender] += msg.value;
    raisedAmount += msg.value;
    emit ContributeEvent(msg.sender, msg.value);
  }

  receive() payable external{
    contribute();
  }

  function getBalance() public view returns (uint){
    return address(this).balance;
  }

  function getRefund() public {
    require(
      block.timestamp > deadline && raisedAmount < goal,
      "Deadline has not passed and raised amount hasnt reach the goal"
    );
    require(contributors[msg.sender] > 0, 'You must be contributor');

    address payable recipient = payable(msg.sender);
    uint value = contributors[msg.sender];

    recipient.transfer(value);
    contributors[msg.sender] = 0;
  }

  function voteRequest(uint _requestNo) public {
    require(contributors[msg.sender] > 0, "You must be a contributor to vote!");
    Request storage thisRequest = requests[_requestNo];

    require(thisRequest.voters[msg.sender] == false, "You have already voted!");
    thisRequest.voters[msg.sender] = true;
    thisRequest.noOfVoters++;
  }

  function makePayment(uint _requestNo) public onlyAdmin {
    require(raisedAmount >= goal, "Goal must be reached!");
    Request storage thisRequest = requests[_requestNo];
    require(thisRequest.completed == false, "Request has been completed!");
    require(
      thisRequest.noOfVoters > noOfContributors / 2,
      "At least half of the contributors, must vote this request"
    );
    thisRequest.recipient.transfer(thisRequest.value);
    thisRequest.completed = true;
    emit MakePaymentEvent(thisRequest.recipient, thisRequest.value);
  }

}
