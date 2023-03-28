import React from 'react'
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry,DisplayAction} from '@jahia/ui-extender';
import {LoaderOverlay} from '../DesignSystem/LoaderOverlay';
import {useQuery} from "@apollo/react-hooks";
import {weakrefContentPropsQuery} from "./components/weakrefContentProps.gql-queries";

//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = (props) => {
    const {field, id, value, editorContext, inputContext, onChange} = props
    const {t} = useTranslation();

    const [selectedChoiceListValue,setSelectedChoiceListValue] = React.useState();
    // console.log("[DamSelector] field : ",field)
    // console.log("[DamSelector] value : ",value)

    const choiceListPickers = field.selectorOptions.find( ({ name }) => name === "choiceListPickers")?.values || [];

    // [['jahia','widen',...],[['jmix:image','jnt:file],[],...]]
    const [choiceListLabels,choiceListNodeTypes] = choiceListPickers.reduce((config,pickerName) => {
            const [labels,nodeTypes] = config;
            labels.push(registry.get('damSelectorConfiguration',pickerName)?.label || 'label unknown');
            nodeTypes.push(registry.get('damSelectorConfiguration',pickerName)?.types || []);
            return [labels,nodeTypes];
        },[[],[]]);

    const {readOnly, label,/* iconName,*/ dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly || field.valueConstraints.length === 0,
        label: choiceListLabels[choiceListPickers.indexOf(selectedChoiceListValue)],
        // iconName: getIconOfField(field, value) || '',
        dropdownData: choiceListLabels.length > 0 ? choiceListLabels.map( (item,index) => {
            // const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            // const iconStart = item.properties?.find(property => property.name === 'iconStart')?.value;
            // const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label: item,
                value: choiceListPickers[index],
                // description: t(description),
                // iconStart: iconStart && toIconComponent(iconStart),
                // iconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': choiceListPickers[index]
                }
            };
        }) : [{label: '', value: ''}]
    }), [t, field, selectedChoiceListValue]);

    const variables = {
        uuid : value,
        skip: !value
    };

    const {loading, error, data} = useQuery(weakrefContentPropsQuery, {
        variables
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

    console.log("[DamSelector] data : ",data)
    const currentNodeTypes = data?.jcr?.result?.primaryNodeType.supertypes?.map(stypes => stypes.name) || [] //data?.jcr?.result?.primaryNodeType?.name
    currentNodeTypes.push(data?.jcr?.result?.primaryNodeType?.name);

    const choiceListValueIndex = choiceListNodeTypes.reduce( (selectedNodeTypeIndex,nodeTypes,index) => {
        const intersection = nodeTypes.filter(nodeType => currentNodeTypes.includes(nodeType));
        if(intersection.length)
            return index;
        return selectedNodeTypeIndex;
    },-1);

    const choiceListValue = choiceListPickers[choiceListValueIndex] || null;



    const getPicker = () => {
        if(!selectedChoiceListValue && !choiceListValue)
            return null;

        // const pickerName = choiceListPickers.values[choiceListIndex];
        let registerComponent = registry.get('selectorType',selectedChoiceListValue || choiceListValue);
        const registerComponentInputContext = {...inputContext}
        if(!registerComponent.cmp){
            registerComponent = registerComponent.resolver([],field);//{name:'type',value:'file'}
            registerComponentInputContext.selectorType = registerComponent;
        }
        props = {
            ...props,
            inputContext:registerComponentInputContext,
        }


        const Component = registerComponent.cmp;

        if(selectedChoiceListValue && selectedChoiceListValue !== choiceListValue)
            props = {
                ...props,
                value:null
            }

        return <Component {...props}/>
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
                    label={label || choiceListLabels[choiceListPickers.indexOf(choiceListValue)]}
                    value={choiceListValue}
                    // icon={iconName && toIconComponent(iconName)}
                    hasSearch={dropdownData && dropdownData.length >= 5}
                    searchEmptyText={t('content-editor:label.contentEditor.global.noResult')}
                    onChange={(evt, item) => {
                        if (item.value !== value) {
                            console.log(item.value);
                            setSelectedChoiceListValue(item.value)
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
                {getPicker()}
            </div>
        </>
    )
}
