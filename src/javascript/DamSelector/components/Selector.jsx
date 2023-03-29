import React from 'react'
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
// import {registry,DisplayAction} from '@jahia/ui-extender';
// import {useNodeInfo} from '@jahia/data-helper';
import {LoaderOverlay} from '../../DesignSystem/LoaderOverlay';
import {useQuery} from "@apollo/react-hooks";
import {weakrefContentPropsQuery} from "./weakrefContentProps.gql-queries";
import {getPicker} from "./utils";


//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const Selector = (props) => {
    const {damSelectorConfigs, field, id, value, editorContext, inputContext} = props
    const {t} = useTranslation();

    const [selectedChoiceListConfig,setSelectedChoiceListConfig] = React.useState();

    const {readOnly, label,/* iconName,*/ dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly || field.valueConstraints.length === 0,
        label: selectedChoiceListConfig?.label,
        // iconName: getIconOfField(field, value) || '',
        dropdownData: damSelectorConfigs.length > 0 ? damSelectorConfigs.map( ({key:picker,label},index) => {
            // const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            // const iconStart = item.properties?.find(property => property.name === 'iconStart')?.value;
            // const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label,
                value: picker,
                // description: t(description),
                // iconStart: iconStart && toIconComponent(iconStart),
                // iconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': picker
                }
            };
        }) : [{label: '', value: ''}]
    }), [t, field, selectedChoiceListConfig]);

    const {loading, error, data} = useQuery(weakrefContentPropsQuery, {
        variables:{
            uuid : value,
            skip: !value
        }
    });

    if (error) {
        const message = t(
            'jcontent:label.jcontent.error.queryingContent',
            {details: error.message ? error.message : nodeError.message ? nodeError.message : ''}
        );

        console.warn(message);
    }

    if (loading) {
        return <LoaderOverlay/>;
    }

    console.log("[Selector] data : ",data)
    const currentNodeTypes = data?.jcr?.result?.primaryNodeType.supertypes?.map(stypes => stypes.name) || [] //data?.jcr?.result?.primaryNodeType?.name
    currentNodeTypes.push(data?.jcr?.result?.primaryNodeType?.name);

    const choiceListConfig = damSelectorConfigs.find( ({types:damSelectorConfigNodeTypes}) =>
        damSelectorConfigNodeTypes.filter(damSelectorConfigNodeType => currentNodeTypes.includes(damSelectorConfigNodeType)).length);

    const getPickerComponent = () => {
        if(!selectedChoiceListConfig && !choiceListConfig)
            return null;

        const selectorType = getPicker(selectedChoiceListConfig || choiceListConfig,field);
        const Component = selectorType.cmp;
        const selectorValue = (selectedChoiceListConfig && selectedChoiceListConfig !== choiceListConfig) ? null : value;
        return <Component {...{
            ...props,
            inputContext:{
                ...inputContext,
                selectorType
            },
            value:selectorValue
        }}/>
    }

    return (
        <>
            <div className="flexFluid flexRow alignCenter">
                <Dropdown
                    className="flexFluid"
                    name={field.name}
                    id={'select-' + id}
                    // imageSize="small"
                    isDisabled={readOnly}
                    maxWidth="100%"
                    variant="outlined"
                    size="medium"
                    data={dropdownData}
                    label={label || choiceListConfig?.label || 'label unknown hein!'}
                    value={choiceListConfig?.key}
                    // icon={iconName && toIconComponent(iconName)}
                    hasSearch={dropdownData && dropdownData.length >= 5}
                    searchEmptyText={t('content-editor:label.contentEditor.global.noResult')}
                    onChange={(evt, item) => {
                        if (item.value !== value) {
                            console.log(item.value);
                            setSelectedChoiceListConfig(damSelectorConfigs.find( ({key:picker}) => picker === item.value));
                        }
                    }}
                    // onBlur={onBlur}
                />
                {/*{inputContext.displayActions && (*/}
                {/*    <DisplayAction actionKey="content-editor/field/Choicelist"*/}
                {/*                   field={field}*/}
                {/*                   inputContext={inputContext}*/}
                {/*                   // render={ButtonRenderer}*/}
                {/*    />*/}
                {/*)}*/}
            </div>
            <div className="flexFluid flexRow alignCenter">
                {getPickerComponent()}
            </div>
        </>
    )
}
