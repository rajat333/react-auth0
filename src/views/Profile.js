import React ,  { useState , useEffect} from "react";
import { Container, Row, Col } from "reactstrap";
import { Badge, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import  axios from "axios";
export const ProfileComponent = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  // const [fetchedData, setFetchedData] = useState('');
  const [email, updateEmail] = useState();
  const [city, updateCity] = useState();
  const [name, updateName] = useState();
  const [profileDescription, updateProfileDes] = useState();
  const [newSkill, updateNewSkill] = useState();
  const [skills, updateSkills] = useState([]);

  useEffect(() => {
    async function updateUserDetails(){
      const token = await getAccessTokenSilently();
      console.log('updateUserDetails ', user);
      const updateUser = await axios.post('http://localhost:3001/api/user/skill',
      { name: name ? name : ' ', 
        email: email ? email: user.email, 
        profileDescription: 'sdsfsd',
        city: city ? city:  ' ',
      },
      { headers: {
            Authorization: `Bearer ${token}`,  
            'Content-Type': 'application/json',
        },
      });
      console.log('updateUser updateUser', updateUser);
      updateName(updateUser.data.newlyUser[0].name);
      updateCity(updateUser.data.newlyUser[0].city);
      updateEmail(updateUser.data.newlyUser[0].email);
      updateSkills(updateUser.data.skills);
      updateProfileDes(updateUser.data.newlyUser[0].profileDescription);
      
    }
    updateUserDetails();
    
  },[]);


  const handleSubmit = e => {
    console.log(' handle submit ',e);
    e.preventDefault();
    console.log('22222222222222');
  }

  const removeSkill = e=>{
    console.log('remove skill ',e.target.id);
    async function addSkillToUser(){
      const token = await getAccessTokenSilently();

      const newSkillAdded = await axios.post('http://localhost:3001/api/user/skill',
      { newSkill: newSkill,
       email: email,
      },
      { headers: {
            Authorization: `Bearer ${token}`,  
            'Content-Type': 'application/json',
        },
      });
      // updateSkills(skills.push(newSkillAdded.data.newSkill));
    }
    addSkillToUser();
    // remove skill api 
  }

  const addNewSkill = e=>{
    console.log(' addd new skill', newSkill);
    async function addSkillToUser(){
      const token = await getAccessTokenSilently();
      const newSkillAdded = await axios.post('http://localhost:3001/api/user/skill',
      { newSkill: newSkill, email: email},
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
      },});
      console.log('newSkillAdded newSkillAdded ', newSkillAdded);
      updateSkills((newSkillAdded.data.skills));
      // updateNewSkill('');
    }
    addSkillToUser();
  }
  return (
    <Container className="mb-5">
      <Row>
        <Highlight>{ user.sub }</Highlight>
        <Form onSubmit={ handleSubmit }>
        <FormGroup>
        <Label for="name">Name </Label>
        <Input type="text"  value={ name }
        name="name" id="name"
        onChange={e => updateName(e.target.value)}
        placeholder="Enter your name" />
      </FormGroup>
      <FormGroup>
        <Label for="exampleEmail">Email </Label>
        <Input type="email"  value={ email }
        onChange={e => updateEmail(e.target.value)}
        name="email" id="exampleEmail" placeholder="with a placeholder" />
      </FormGroup>
      <FormGroup>
        <Label for="city">City </Label>
        <Input type="text"  value={ city }
        name="city" id="city" 
        onChange={e => updateCity(e.target.value)}
        placeholder="with a placeholder" />
      </FormGroup>
      <FormGroup>
        <Label for="examplePassword">Skills</Label>
        <Input type="text" name="newSkill" id="skill" 
        placeholder="Enter new skills"
        onChange={e => updateNewSkill(e.target.value)}
        />
        <Button color="info" onClick={ addNewSkill } >Add</Button>
        </FormGroup>
        <FormGroup>
        {
          skills.map( (e,index) =>{
            console.log('eeeeeeee', e);
              return (
                <Button key={index} style={{ margin :'0px 6px 0px 5px' }} color="secondary" type="button">
                   <span >{ e.skillName }</span>
                  <Badge id = { e.id } style={ { top:'-16px', }}  className="badge-circle badge-floating border-white"
                    color="danger" size="sd" id = { index } 
                    onClick  ={ removeSkill }
                    > X </Badge>
                </Button>
                // <h6 key={ e+Math.random() }> <Badge color="secondary">{ e }</Badge> </h6>
              )
          })
        }
      </FormGroup>
      <Button>Submit</Button>
    </Form>

      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
