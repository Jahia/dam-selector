import React from 'react';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {LoaderOverlay} from '../DesignSystem/LoaderOverlay';
import {Selector, weakrefContentPropsQuery} from './components';
import {useQuery} from '@apollo/react-hooks';
import {PickerComponent} from './components';
import PropTypes from 'prop-types';

// Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = props => {
    const {value, editorContext, inputContext} = props;
    const {t} = useTranslation();

    // Check modules loaded to prepare the selector
    const siteNodeInfo = useNodeInfo({path: '/sites/' + editorContext.site}, {
        getSiteInstalledModules: true
    });

    const weakNodeInfo = useQuery(weakrefContentPropsQuery, {
        variables: {
            uuid: value
        },
        skip: !value
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

    // Get Dam Modules selector config
    const installedModules = siteNode?.installedModulesWithAllDependencies;
    const damSelectorConfigs = registry.find({type: 'damSelectorConfiguration'}).filter(({module}) => installedModules.includes(module));
    if (!value) {
        damSelectorConfigs.forEach(damSelectorConfig => {
            damSelectorConfig.value = null;
        });
    }
    // DamSelectorConfigs.map( damSelectorConfig => ({...damSelectorConfig,value:null}))

    const superTypes = weakNode?.primaryNodeType.supertypes?.map(({name}) => name) || [];
    const mixinTypes = weakNode?.mixinTypes.map(({name}) => name) || [];
    const primaryNodeType = weakNode?.primaryNodeType?.name;
    const valueNodeTypes = [primaryNodeType, ...superTypes, ...mixinTypes];

    // Case 'default' that means jahia picker
    if (damSelectorConfigs.length === 1) {
        // Check if current content is a jnt:file
        const managedValue = !valueNodeTypes.includes('jnt:file')? null : value;
        // Get jahia picker
        return <PickerComponent choiceListConfig={{...damSelectorConfigs[0],value:managedValue}} {...props}/>;
    }

    // More than one dropdown entry
    const valueChoiceListConfig = damSelectorConfigs.find(({types: damSelectorConfigNodeTypes}) =>
        damSelectorConfigNodeTypes.filter(damSelectorConfigNodeType => valueNodeTypes.includes(damSelectorConfigNodeType)).length);
    if (valueChoiceListConfig) {
        valueChoiceListConfig.value = value;
    }

    return <Selector damSelectorConfigs={damSelectorConfigs} valueChoiceListConfig={valueChoiceListConfig} {...props}/>;
};

DamSelector.propTypes = {
    value: PropTypes.string.isRequired,
    editorContext: PropTypes.shape({
        site: PropTypes.string.isRequired,
        lang: PropTypes.string.isRequired
    }).isRequired
};
