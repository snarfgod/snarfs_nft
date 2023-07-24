import ProgressBar from 'react-bootstrap/ProgressBar';

const Progress = ({tokensSold, maxTokens}) => {
    return(
        <div>
            <ProgressBar now={((tokensSold/maxTokens)*100)} label={`${(tokensSold / maxTokens) * 100}%`}/>
        </div>
    )
}
export default Progress;
