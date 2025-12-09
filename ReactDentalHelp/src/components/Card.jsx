import '../assets/css/card.css';

function Card(props){

    var title = props.title;
    if(props.title === "Istoric programari Date Personale")
    {
        title = (
            <>
                Istoric programari<br />Date personale
            </>
        );
    }

    return(
        <div className="card cursor-pointer" onClick={props.onClick}>
            <h1 className="cardTitle">{title}</h1>
            <img className="cardImage" src={props.image_source} alt="appointment image"></img>
        </div>
    );

}

export default Card;
