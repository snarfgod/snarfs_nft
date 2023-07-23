import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

const Buy = ({provider, price, crowdsale, setIsLoading}) => {
    return(
        <Form style={{ maxWidth: '300px', margin: '50px auto'}}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control type='number' placeholder='Enter amount'></Form.Control>
                </Col>
                <Col>
                    <Button type='submit'>Buy Tokens</Button>
                </Col>
            </Form.Group>
        </Form>
    )
}

export default Buy;
