import React from "react";
import {registry} from "@jahia/ui-extender";

export const getPicker = (damSelectorConfig,field) => {
    if(!damSelectorConfig)
        return null;

    let selectorType = registry.get('selectorType',damSelectorConfig.key);
    if(!selectorType.cmp)
        selectorType = selectorType.resolver([],field);//{name:'type',value:'file'}

    return selectorType;
}
