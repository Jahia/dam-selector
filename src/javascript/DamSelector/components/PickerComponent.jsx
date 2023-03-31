import {getPicker} from "./utils";
import React from "react";


export const PickerComponent = (props) => {
    const {choiceListConfig,resetValue,field,inputContext,value} = props;
    if(!choiceListConfig)
        return null;

    const selectorType = getPicker(choiceListConfig,field);
    const Component = selectorType.cmp;

    return <Component {...{
        ...props,
        inputContext:{
            ...inputContext,
            selectorType
        },
        value: resetValue ? null : value
    }}/>
}
