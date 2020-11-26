import React ,  { useState , useEffect} from "react";
import { Container, Row, Col } from "reactstrap";
import { Badge, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
// import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const ProfileComponent = () => {
  const { user } = useAuth0();
  // const [fetchedData, setFetchedData] = useState('');
  const [email, updateEmail] = useState();
  const [city, updateCity] = useState();
  const [name, updateName] = useState();
  const [skills, updateSkills] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      const response = await fetch('https://reqres.in/api/users/2');
      const json = await response.json();
      console.log('json json ', json.data.email);
      updateEmail(json.data.email);
      updateCity('Jind');
      const skills = ["Node", "C++", "ReactJs"];
      updateSkills(skills);
      updateName(user.nickname);
  }
  fetchBooks();
  },[]);


  const handleSubmit = e => {
    console.log(' handle submit ',e);
    e.preventDefault();
    console.log('22222222222222');
  }

  const removeSkill = e=>{
    console.log('remove skill ',e.target.id);
    // remove skill api 
  }

  return (
    <Container className="mb-5">
      <Row>
        {/* <Highlight>{JSON.stringify(user, null, 2)}</Highlight> */}
        <Form onSubmit={ handleSubmit }>
        <FormGroup>
        <Label for="name">Name </Label>
        <Input type="text"  value={ name }
        name="name" id="name" placeholder="Enter your name" />
      </FormGroup>
      <FormGroup>
        <Label for="exampleEmail">Email </Label>
        <Input type="email"  value={ email }
        name="email" id="exampleEmail" placeholder="with a placeholder" />
      </FormGroup>
      <FormGroup>
        <Label for="city">City </Label>
        <Input type="text"  value={ city }
        name="city" id="city" placeholder="with a placeholder" />
      </FormGroup>
      <FormGroup>
        <Label for="examplePassword">Skills</Label>
        <Input type="text" name="skill" id="skill" placeholder="Enter new skills" />
        <Button color="info">Add</Button>
        </FormGroup>
        <FormGroup>
        {
          skills.map( (e,index) =>{
              return (
                <Button key={index} style={{ margin :'0px 6px 0px 5px' }} color="secondary" type="button">
                   <span >{ e }</span>
                  <Badge style={ { top:'-16px', }}  className="badge-circle badge-floating border-white"
                    color="danger" size="sd" id = { index } 
                    onClick  ={ removeSkill }
                    > X </Badge>
                </Button>
                // <h6 key={ e+Math.random() }> <Badge color="secondary">{ e }</Badge> </h6>
              )
          })
        }
      </FormGroup>
      {/* <FormGroup>
        <Label for="exampleSelect">Select</Label>
        <Input type="select" name="select" id="exampleSelect">
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </Input>
      </FormGroup> */}
      {/* <FormGroup>
        <Label for="exampleSelectMulti">Select Multiple</Label>
        <Input type="select" name="selectMulti" id="exampleSelectMulti" multiple>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </Input>
      </FormGroup> */}
      {/* <FormGroup>
        <Label for="exampleText">Text Area</Label>
        <Input type="textarea" name="text" id="exampleText" />
      </FormGroup> */}
      {/* <FormGroup>
        <Label for="exampleFile">File</Label>
        <Input type="file" name="file" id="exampleFile" />
        <FormText color="muted">
          This is some placeholder block-level help text for the above input.
          It's a bit lighter and easily wraps to a new line.
        </FormText>
      </FormGroup> */}
      {/* <FormGroup tag="fieldset">
        <legend>Radio Buttons</legend>
        <FormGroup check>
          <Label check>
            <Input type="radio" name="radio1" />{' '}
            Option one is this and that—be sure to include why it's great
          </Label>
        </FormGroup> */}
        {/* <FormGroup check>
          <Label check>
            <Input type="radio" name="radio1" />{' '}
            Option two can be something else and selecting it will deselect option one
          </Label>
        </FormGroup> */}
        {/* <FormGroup check disabled>
          <Label check>
            <Input type="radio" name="radio1" disabled />{' '}
            Option three is disabled
          </Label>
        </FormGroup> */}
      {/* </FormGroup> */}
      {/* <FormGroup check>
        <Label check>
          <Input type="checkbox" />{' '}
          Check me out
        </Label>
      </FormGroup> */}
      <Button>Submit</Button>
    </Form>

      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
