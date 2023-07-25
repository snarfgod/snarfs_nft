
const Time = ({startTime, endTime}) => {
    return(
        <div className = "text-center my-3">
            <p><strong>Sale Begins: </strong>{startTime}</p>
            <p><strong>Sale Ends: </strong>{endTime}</p>
            <p><strong>Time remaining:</strong>{endTime-startTime}</p>
        </div>
    )
}

export default Time;
