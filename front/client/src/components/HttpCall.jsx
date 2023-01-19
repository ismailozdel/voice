import React from "react";
import { useState } from "react";
import { useEffect } from "react";

function HttpCall() {

    const [data,setData] = useState("")

    useEffect(() => {
        fetch("/http-call",{
            headers:{
                "Content-Type":"application/json"
            }
        }).then((response) => response.json()).then((responseData) => {setData(responseData.json)})
    })

    return (
        <h3>
            {data}
        </h3>
    )
}

export default HttpCall