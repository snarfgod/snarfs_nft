
const Time = ({startTimeDate, endTimeDate, startTime, endTime}) => {
    return(
        <div className = "text-center my-3">
            <p><strong>Sale Begins: </strong>{startTimeDate}</p>
            <p><strong>Sale Ends: </strong>{endTimeDate}</p>
            <p><strong>Time remaining:</strong>{(endTime-startTime)/60/60/24} days</p>
        </div>
    )
}

export default Time;
