import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    // Testing the adopt() function
    function testUserCanAdoptPet() public {
        uint returnedId = adoption.adopt(8);

        uint expected = 9;

        Assert.equal(returnedId, expected, "Adoption of pet ID 8 should be recorded.");
    }
}