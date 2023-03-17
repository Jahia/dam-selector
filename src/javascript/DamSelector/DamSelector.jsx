import React from 'react'
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry,DisplayAction} from '@jahia/ui-extender';
import {LoaderOverlay} from '../DesignSystem/LoaderOverlay';
import {useQuery} from "@apollo/react-hooks";
import {weakrefContentPropsQuery} from "./components/weakrefContentProps.gql-queries";


const getLabel = (field, value) => {
    const choiceListLabels = field.selectorOptions.find( ({ name }) => name === "choiceListLabels");
    const choiceListPickers = field.selectorOptions.find( ({ name }) => name === "choiceListPickers");
    const index = choiceListPickers.values.indexOf(value);

    return choiceListLabels.values[index];
}

//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = (props) => {
    const {field, id, value, editorContext, inputContext, onChange} = props
    const {t} = useTranslation();

    //TODO do an choiceListValue based on weak ref content type ?
    const [selectedChoiceListValue,setSelectedChoiceListValue] = React.useState();
    console.log("[DamSelector] field : ",field)
    console.log("[DamSelector] value : ",value)

    const choiceListLabels = field.selectorOptions.find( ({ name }) => name === "choiceListLabels");
    const choiceListPickers = field.selectorOptions.find( ({ name }) => name === "choiceListPickers");
    const choiceListNodeTypes = field.selectorOptions.find( ({ name }) => name === "choiceListNodeTypes");

    const {readOnly, label,/* iconName,*/ dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly || field.valueConstraints.length === 0,
        label: getLabel(field, selectedChoiceListValue),
        // iconName: getIconOfField(field, value) || '',
        dropdownData: choiceListLabels.values.length > 0 ? choiceListLabels.values.map( (item,index) => {
            // const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            // const iconStart = item.properties?.find(property => property.name === 'iconStart')?.value;
            // const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label: item,
                value: choiceListPickers.values[index],
                // description: t(description),
                // iconStart: iconStart && toIconComponent(iconStart),
                // iconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': choiceListPickers.values[index]
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
    const types = data?.jcr?.result?.mixinTypes?.map(mixin => mixin.name) || [] //data?.jcr?.result?.primaryNodeType?.name
    types.push(data?.jcr?.result?.primaryNodeType?.name);
    const intersection = choiceListNodeTypes.values.filter(type => types.includes(type));

    const choiceListValueIndex = choiceListNodeTypes.values.indexOf(intersection[0]);
    const choiceListValue = choiceListPickers.values[choiceListValueIndex] || null;



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
                    label={label || getLabel(field,choiceListValue)}
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
