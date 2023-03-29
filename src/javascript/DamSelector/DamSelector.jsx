import React from 'react'
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry,DisplayAction} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {LoaderOverlay} from '../DesignSystem/LoaderOverlay';
import {getPicker,Selector} from "./components";

//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = (props) => {
    const {field, id, value, editorContext, inputContext, onChange} = props
    const {t} = useTranslation();

    //Check modules loaded to prepare the selector
    const {node, loading, error} = useNodeInfo({path: '/sites/' + editorContext.site}, {
        getSiteInstalledModules: true
    });

    if (error) {
        const message = t(
            'jcontent:label.jcontent.error.queryingContent',
            {details: error.message ? error.message : ''}
        );

        console.warn(message);
    }

    if (loading) {
        return <LoaderOverlay/>;
    }

    //get Dam Modules selector config
    const installedModules = node?.site?.installedModulesWithAllDependencies;
    const damSelectorConfigs = registry.find({type: "damSelectorConfiguration"}).filter(config => installedModules.includes(config.module));

    //case 'default' that mean jahia picker
    if(damSelectorConfigs.length === 1){
        //get jahia picker
        const selectorType = getPicker(damSelectorConfigs[0],field)
        const Component = selectorType.cmp;

        return <Component {...{
            ...props,
            inputContext:{
                ...inputContext,
                selectorType
            }
        }}/>
    }

    return <Selector damSelectorConfigs={damSelectorConfigs}  {...props}/>
}
