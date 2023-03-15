import React from 'react'
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry,DisplayAction} from '@jahia/ui-extender';


//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
export const DamSelector = (props) => {
    const {field, id, value, editorContext, inputContext, onChange} = props
    const {t} = useTranslation();
    //TODO do an choiceListValue based on weak ref content type ?
    const [choiceListIndex,setChoiceListIndex] = React.useState();
    console.log("[DamSelector] field : ",field)
    const choiceListLabels = field.selectorOptions.find( ({ name }) => name === "choiceListLabels");
    const choiceListPicker = field.selectorOptions.find( ({ name }) => name === "choiceListPicker");
    // options.values.forEach(v => {
    //     const [label,picker] = JSON.parse(v);
    //     console.log("[DamSelector] label :",label,"; picker :",picker);
    // })
    const {readOnly, label,/* iconName,*/ dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly || field.valueConstraints.length === 0,
        label: "",//getLabel(field, value, t),
        // iconName: getIconOfField(field, value) || '',
        dropdownData: choiceListLabels.values.length > 0 ? choiceListLabels.values.map( (item,index) => {
            // const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            // const iconStart = item.properties?.find(property => property.name === 'iconStart')?.value;
            // const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label: item,
                value: index,
                // description: t(description),
                // iconStart: iconStart && toIconComponent(iconStart),
                // iconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': index
                }
            };
        }) : [{label: '', value: ''}]
    }), [t, field, value]);

    const getPicker = () => {
        if(!choiceListIndex || choiceListIndex < 0)
            return null;

        const pickerName = choiceListPicker.values[choiceListIndex];
        const registerComponent = registry.get('selectorType',pickerName);
        const Component = registerComponent.cmp;
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
                    label={label}
                    value={choiceListIndex}
                    // icon={iconName && toIconComponent(iconName)}
                    hasSearch={dropdownData && dropdownData.length >= 5}
                    searchEmptyText={t('content-editor:label.contentEditor.global.noResult')}
                    onChange={(evt, item) => {
                        if (item.value !== value) {
                            console.log(item.value);
                            setChoiceListIndex(item.value)
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
            <div>
                {getPicker()}
            </div>
        </>
    )
}
