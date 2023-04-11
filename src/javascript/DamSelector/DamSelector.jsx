import React from 'react'
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {LoaderOverlay} from '../DesignSystem/LoaderOverlay';
import {Selector, weakrefContentPropsQuery} from "./components";
import {useQuery} from "@apollo/react-hooks";
import {PickerComponent} from "./components";

//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = (props) => {
    const {value, editorContext} = props
    const {t} = useTranslation();

    //Check modules loaded to prepare the selector
    const siteNodeInfo = useNodeInfo({path: '/sites/' + editorContext.site}, {
        getSiteInstalledModules: true
    });

    const weakNodeInfo = useQuery(weakrefContentPropsQuery, {
        variables:{
            uuid : value,
            skip: !value
        }
    });
    const error = siteNodeInfo?.error || weakNodeInfo?.error;
    const loading = siteNodeInfo?.loading || weakNodeInfo?.loading;

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

    const siteNode = siteNodeInfo.node.site;
    const weakNode = weakNodeInfo?.data?.jcr?.result;

    //get Dam Modules selector config
    const installedModules = siteNode?.installedModulesWithAllDependencies;
    const damSelectorConfigs = registry.find({type: "damSelectorConfiguration"}).filter(({module}) => installedModules.includes(module));

    const superTypes = weakNode?.primaryNodeType.supertypes?.map(({name}) => name) || [];
    const mixinTypes = weakNode?.mixinTypes.map(({name}) => name) || [];
    const primaryNodeType = weakNode?.primaryNodeType?.name;
    const valueNodeTypes = [primaryNodeType,...superTypes,...mixinTypes];

    //case 'default' that means jahia picker
    if(damSelectorConfigs.length === 1){
        //check if current content is a jnt:file
        const valueCannotBeManagedByJahiaPicker = !valueNodeTypes.includes("jnt:file");
        //get jahia picker
        return <PickerComponent choiceListConfig={damSelectorConfigs[0]} resetValue={valueCannotBeManagedByJahiaPicker} {...props}/>
    }

    //More than one dropdown entry
    const valueChoiceListConfig = damSelectorConfigs.find( ({types:damSelectorConfigNodeTypes}) =>
        damSelectorConfigNodeTypes.filter(damSelectorConfigNodeType => valueNodeTypes.includes(damSelectorConfigNodeType)).length);

    return <Selector damSelectorConfigs={damSelectorConfigs} valueChoiceListConfig={valueChoiceListConfig} {...props}/>
}
