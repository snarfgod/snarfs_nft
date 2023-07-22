import Spinner from 'react-bootstrap/Spinner';

const Loading = ({isLoading}) => {
    return(
        <div className='text-center my-5'>
            <Spinner animation='grow' />
            <p className='my-2'>Loading...</p>
        </div>
    )
}

export default Loading;
