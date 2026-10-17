import { useMobileStyles, useMobileColors } from '../../ui/theme/useMobileTheme'
import { Plus, WarningCircle, X } from 'phosphor-react-native'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mobileCopy, mobileText } from '../../i18n/mobileText'
import { type MobileLayoutProbe, probeProps, useMobileLayoutProbe } from '../../qa/mobileLayoutProbe'
import { desktopRelationshipParity } from '../../ui/desktopParity'
import { MobileChip } from '../../ui/MobileChip'
import { MobilePanel, MobileToolbar, MobileToolbarSpacer, MobileToolbarTitle } from '../../ui/MobilePanel'
import { MobileIconButton } from '../../ui/MobileIconButton'
import { MobilePropertyRow } from '../../ui/MobilePropertyRow'
import { useMobileDeviceLayout } from '../../ui/useMobileDeviceLayout'

import { mobileFrontmatterState, needsMobileFrontmatterNotice } from '../../workspace/mobileFrontmatterState'
import {
  type MobileInspectorPropertySlot,
  type MobileInspectorRelationshipSlot,
  mobileInspectorPropertySlots,
  mobileInspectorRelationshipSlots,
} from '../../workspace/mobileInspectorSchema'
import { resolveMobileMissingTypeName } from '../../workspace/mobileMissingType'
import type { MobileNeighborhoodGroup } from '../../workspace/mobileNeighborhood'
import { type MobilePropertyDisplay, mobilePropertyDisplay } from '../../workspace/mobilePropertyDisplay'
import type {
  MobileNote,
  MobileProperty,
  MobilePropertyDisplayMode,
  MobilePropertyValue,
  MobileRelationship,
  MobileTypeDefinitions,
} from '../../workspace/mobileWorkspaceModel'
import { Text } from '../ui/text'
import { MobileFrontmatterStateNotice } from './MobileFrontmatterStateNotice'
import { createPropertyPanelStyles } from './MobilePropertiesPanel.styles'
import {
  mobileInspectorPlaceholderActionLabel,
  mobileInspectorReferenceRowLayoutContract,
  mobileRelationshipValueMetricSegments,
} from './MobilePropertiesPanelModel'
import { MobileTypeIcon } from './MobileWorkspaceIcons'
import { chipTone, noteTypeColor, noteTypeSoftColor, statusTone, tagTone } from './mobileWorkspaceTone'

type MobilePropertiesPanelProps = {
  compact: boolean
  fullWidth?: boolean
  showToolbar?: boolean
  layoutProbe?: boolean
  note: MobileNote | null
  onAddProperty: (key?: string) => void
  onAddRelationship: (key?: string) => void
  onDeleteProperty: (noteId: string, key: string) => void
  onEditProperty: (noteId: string, key: string, value: MobilePropertyValue) => void
  onEnterNeighborhood?: (noteId: string) => void
  onFixInvalidFrontmatter?: () => void
  onInitializeProperties: (noteId: string) => void
  onCreateMissingType: (typeName: string) => void
  onOpenChangeNoteType: () => void
  onRemoveRelationship: (noteId: string, key: string, ref: string) => void
  onSelectNote: (noteId: string) => void
  propertyDisplayModes?: Record<string, MobilePropertyDisplayMode> | null
  referenceGroups?: MobileNeighborhoodGroup[]
  typeDefinitions?: MobileTypeDefinitions
}

export function MobilePropertiesPanel(props: MobilePropertiesPanelProps) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { panelStyles } = themeStyles
  const { bottom } = useSafeAreaInsets()
  const {
    compact,
    fullWidth = false,
    layoutProbe = false,
  } = props
  const propertyLayoutProbe = useMobileLayoutProbe(layoutProbe)

  return (
    <MobilePanel
      {...probeProps(propertyLayoutProbe.probe, 'properties.panel')}
      style={[
        panelStyles.panel,
        compact ? panelStyles.panelCompact : null,
        fullWidth ? panelStyles.panelFullWidth : null,
      ]}
      testID="properties-panel"
    >
      <PropertiesPanelToolbar {...props} />
      <ScrollView
        {...probeProps(propertyLayoutProbe.probe, 'properties.scroll')}
        contentContainerStyle={[panelStyles.content, props.note ? null : panelStyles.emptyContent, { paddingBottom: panelStyles.content.padding + bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <PropertiesPanelContent layoutProbe={propertyLayoutProbe.probe} props={props} />
      </ScrollView>
    </MobilePanel>
  )
}

function PropertiesPanelToolbar(props: MobilePropertiesPanelProps) {
  const mobileColors = useMobileColors()
  if (props.showToolbar === false) return null
  return <MobileToolbar testID="properties-toolbar">
    <MobileToolbarTitle testID="properties-toolbar-title" title={mobileCopy.properties} variant="inspector" />
    <MobileToolbarSpacer />
    {props.note ? <MobileIconButton
      accessibilityLabel={mobileText('inspector.properties.addProperty')}
      testID="properties-toolbar-add"
      onPress={() => props.onAddProperty()}
    ><Plus size={16} color={mobileColors.textMuted} /></MobileIconButton> : null}
  </MobileToolbar>
}

function PropertiesPanelContent({
  layoutProbe,
  props,
}: {
  layoutProbe: MobileLayoutProbe
  props: MobilePropertiesPanelProps
}) {
  if (!props.note) return <PropertiesEmptyState />

  return (
    <NoteProperties
      layoutProbe={layoutProbe}
      {...notePropertiesProps(props)}
    />
  )
}

function notePropertiesProps(props: MobilePropertiesPanelProps): Omit<NotePropertiesProps, 'layoutProbe'> {
  if (!props.note) throw new Error('A selected note is required to build property rows')

  return {
    note: props.note,
    onAddProperty: props.onAddProperty,
    onAddRelationship: props.onAddRelationship,
    onEditProperty: props.onEditProperty,
    onEnterNeighborhood: props.onEnterNeighborhood,
    onFixInvalidFrontmatter: props.onFixInvalidFrontmatter,
    onInitializeProperties: props.onInitializeProperties,
    onCreateMissingType: props.onCreateMissingType,
    onOpenChangeNoteType: props.onOpenChangeNoteType,
    onRemoveRelationship: props.onRemoveRelationship,
    onSelectNote: props.onSelectNote,
    propertyDisplayModes: props.propertyDisplayModes,
    referenceGroups: props.referenceGroups ?? [],
    typeDefinitions: props.typeDefinitions,
  }
}

type NotePropertiesProps = {
  layoutProbe: MobileLayoutProbe
  note: MobileNote
  onAddProperty: (key?: string) => void
  onAddRelationship: (key?: string) => void
  onEditProperty: (noteId: string, key: string, value: MobilePropertyValue) => void
  onEnterNeighborhood?: (noteId: string) => void
  onFixInvalidFrontmatter?: () => void
  onInitializeProperties: (noteId: string) => void
  onCreateMissingType: (typeName: string) => void
  onOpenChangeNoteType: () => void
  onRemoveRelationship: (noteId: string, key: string, ref: string) => void
  onSelectNote: (noteId: string) => void
  propertyDisplayModes?: Record<string, MobilePropertyDisplayMode> | null
  referenceGroups: MobileNeighborhoodGroup[]
  typeDefinitions?: MobileTypeDefinitions
}

function NoteProperties(props: NotePropertiesProps) {
  const phone = useMobileDeviceLayout() === 'phone'
  const { layoutProbe, note, onFixInvalidFrontmatter, onInitializeProperties, onSelectNote, referenceGroups, typeDefinitions } = props
  const frontmatterState = mobileFrontmatterState(note)
  const propertySlots = mobileInspectorPropertySlots(note, typeDefinitions)
  const relationshipSlots = mobileInspectorRelationshipSlots(note, typeDefinitions)
  const missingTypeName = resolveMobileMissingTypeName(note, typeDefinitions)

  if (needsMobileFrontmatterNotice(frontmatterState)) {
    return (
      <>
        <MobileFrontmatterStateNotice
          state={frontmatterState}
          onFixInvalidFrontmatter={onFixInvalidFrontmatter}
          onInitializeProperties={() => onInitializeProperties(note.id)}
        />
        <ReferenceGroups
          groups={referenceGroups}
          layoutProbe={layoutProbe}
          typeDefinitions={typeDefinitions}
          onSelectNote={onSelectNote}
        />
      </>
    )
  }

  return (
    <>
      <StandardPropertyRows missingTypeName={missingTypeName} props={props} />
      <CustomPropertyRows propertySlots={phone ? [] : propertySlots} props={props} />
      <RelationshipPropertyRows relationshipSlots={phone ? [] : relationshipSlots} props={props} />
      <PropertyActionsAndReferences props={props} />
      {phone ? <InspectorPlaceholderRows propertySlots={propertySlots} relationshipSlots={relationshipSlots} props={props} /> : null}
    </>
  )
}

function StandardPropertyRows({ missingTypeName, props }: { missingTypeName: string | null; props: NotePropertiesProps }) {
  const { layoutProbe, note, onCreateMissingType, onEditProperty, onOpenChangeNoteType } = props

  return (
    <>
      <TypePropertyRow
        layoutProbe={layoutProbe}
        missingTypeName={missingTypeName}
        note={note}
        onCreateMissingType={onCreateMissingType}
        onOpenChangeNoteType={onOpenChangeNoteType}
      />
      {note.status ? (
        <MobilePropertyRow
          label={mobileText('noteList.sort.status')}
          testID="property-row-status"
          value={
            <EditableChipValue
              label={note.status}
              testID="property-row-status-edit"
              tone={statusTone(note.status)}
              onPress={() => onEditProperty(note.id, 'Status', note.status)}
            />
          }
          layoutProbe={layoutProbe}
          layoutProbeId="properties.row.status"
        />
      ) : null}
      <MobilePropertyRow label={mobileText('noteList.sort.created')} layoutProbe={layoutProbe} layoutProbeId="properties.row.created" testID="property-row-created" value={note.created} />
      <MobilePropertyRow label={mobileCopy.modified} layoutProbe={layoutProbe} layoutProbeId="properties.row.modified" testID="property-row-modified" value={note.modified} />
      <MobilePropertyRow
        label={mobileText('inspector.properties.workspace')}
        layoutProbe={layoutProbe}
        layoutProbeId="properties.row.workspace"
        testID="property-row-workspace"
        value={<WorkspaceBadge label={note.workspace} />}
      />
      <PropertySection label="Tags" layoutProbe={layoutProbe} layoutProbeId="properties.section.tags" testID="property-section-tags">
        <EditableTagsValue labels={note.tags} onPress={() => onEditProperty(note.id, 'tags', note.tags)} />
      </PropertySection>
      <MobilePropertyRow label="Links" layoutProbe={layoutProbe} layoutProbeId="properties.row.links" testID="property-row-links" value={`${note.links}`} />
    </>
  )
}

function CustomPropertyRows({ propertySlots, props }: { propertySlots: MobileInspectorPropertySlot[]; props: NotePropertiesProps }) {
  const { layoutProbe, note, onEditProperty, propertyDisplayModes } = props

  return (
    <>
      {note.icon ? (
        <EditablePropertyRow
          layoutProbe={layoutProbe}
          noteId={note.id}
          property={{ key: 'icon', label: 'Icon', value: note.icon }}
          onEditProperty={onEditProperty}
        />
      ) : null}
      {note.properties?.map((property) => (
        <EditablePropertyRow
          key={property.key}
          layoutProbe={layoutProbe}
          noteId={note.id}
          property={property}
          propertyDisplayModes={propertyDisplayModes}
          onEditProperty={onEditProperty}
        />
      ))}
      <InspectorPlaceholderRows propertySlots={propertySlots} props={props} />
    </>
  )
}

function RelationshipPropertyRows({ relationshipSlots, props }: { relationshipSlots: MobileInspectorRelationshipSlot[]; props: NotePropertiesProps }) {
  const { layoutProbe, note, onAddRelationship, onEnterNeighborhood, onRemoveRelationship, onSelectNote, typeDefinitions } = props

  return (
    <>
      {note.relationships.map((relationship) => (
        <PropertySection
          key={`${relationship.kind}-${relationship.label ?? relationship.values.map((value) => value.title).join('-')}`}
          label={relationshipHeading(relationship)}
          layoutProbe={layoutProbe}
          layoutProbeId={`properties.section.${testIdSegment(relationshipHeading(relationship))}`}
          testID={`property-section-${relationship.kind}`}
        >
          <RelationshipValues
            layoutProbe={layoutProbe}
            noteId={note.id}
            relationship={relationship}
            onRemoveRelationship={onRemoveRelationship}
            onEnterNeighborhood={onEnterNeighborhood}
            typeDefinitions={typeDefinitions}
            onSelectNote={onSelectNote}
          />
          <PropertyActionRow
            label={mobileText('inspector.relationship.add')}
            testID={`relationship-add-${testIdSegment(relationship.key ?? relationshipHeading(relationship))}`}
            onPress={() => onAddRelationship(relationship.key ?? relationshipHeading(relationship))}
          />
        </PropertySection>
      ))}
      <InspectorPlaceholderRows relationshipSlots={relationshipSlots} props={props} />
    </>
  )
}

function InspectorPlaceholderRows({ propertySlots = [], relationshipSlots = [], props }: {
  propertySlots?: MobileInspectorPropertySlot[]
  relationshipSlots?: MobileInspectorRelationshipSlot[]
  props: NotePropertiesProps
}) {
  return <>
    {propertySlots.map((slot) => (
      <PlaceholderPropertyRow key={`${slot.source}:${slot.key}`} layoutProbe={props.layoutProbe} slot={slot} onPress={() => props.onAddProperty(slot.key)} />
    ))}
    {relationshipSlots.map((slot) => (
      <PlaceholderRelationshipSection key={`${slot.source}:${slot.key}`} layoutProbe={props.layoutProbe} slot={slot} onPress={() => props.onAddRelationship(slot.key)} />
    ))}
  </>
}

function PropertyActionsAndReferences({ props }: { props: NotePropertiesProps }) {
  const { layoutProbe, onAddProperty, onAddRelationship, onSelectNote, referenceGroups, typeDefinitions } = props

  return (
    <>
      <PropertyActionRow label={mobileText('inspector.properties.addProperty')} layoutProbe={layoutProbe} layoutProbeId="properties.action.add-property" testID="property-action-add-property" onPress={() => onAddProperty()} />
      <PropertyActionRow label={mobileText('inspector.relationship.addRelationship')} layoutProbe={layoutProbe} layoutProbeId="properties.action.add-relationship" testID="property-action-add-relationship" onPress={() => onAddRelationship()} />
      <ReferenceGroups groups={referenceGroups} layoutProbe={layoutProbe} typeDefinitions={typeDefinitions} onSelectNote={onSelectNote} />
    </>
  )
}

function TypePropertyRow({
  layoutProbe,
  missingTypeName,
  note,
  onCreateMissingType,
  onOpenChangeNoteType,
}: {
  layoutProbe: MobileLayoutProbe
  missingTypeName: string | null
  note: MobileNote
  onCreateMissingType: (typeName: string) => void
  onOpenChangeNoteType: () => void
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { typeStyles } = themeStyles
  return (
    <MobilePropertyRow
      label="Type"
      testID="property-row-type"
      value={
        <View style={typeStyles.value}>
          <EditableChipValue
            label={note.type}
            testID="property-row-type-edit"
            tone={chipTone(note.typeTone)}
            onPress={onOpenChangeNoteType}
          />
          {missingTypeName ? (
            <MissingTypeButton typeName={missingTypeName} onPress={() => onCreateMissingType(missingTypeName)} />
          ) : null}
        </View>
      }
      layoutProbe={layoutProbe}
      layoutProbeId="properties.row.type"
    />
  )
}

function MissingTypeButton({ onPress, typeName }: { onPress: () => void; typeName: string }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { typeStyles } = themeStyles
  const mobileColors = useMobileColors()
  const label = mobileText('inspector.properties.missingTypeAria').replace('{type}', typeName)

  return (
    <Pressable
      accessibilityHint={mobileText('sidebar.action.createType')}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={typeStyles.missingButton}
      testID="missing-type-warning"
      onPress={onPress}
    >
      <WarningCircle color={mobileColors.orange} size={14} weight="bold" />
      <Text numberOfLines={1} style={typeStyles.missingText}>
        {mobileText('inspector.properties.missingType')}
      </Text>
    </Pressable>
  )
}

function EditableChipValue({
  label,
  onPress,
  testID,
  tone,
}: {
  label: string
  onPress: () => void
  testID: string
  tone: Parameters<typeof MobileChip>[0]['tone']
}) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" testID={testID} onPress={onPress}>
      <MobileChip label={label} tone={tone} />
    </Pressable>
  )
}

function EditableTagsValue({ labels, onPress }: { labels: string[]; onPress: () => void }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  if (labels.length > 0) {
    return (
      <Pressable accessibilityLabel="Tags" accessibilityRole="button" testID="property-tags-edit" onPress={onPress}>
        <TagWrap labels={labels} />
      </Pressable>
    )
  }

  return (
    <Pressable
      accessibilityLabel="Tags"
      accessibilityRole="button"
      style={propertyStyles.emptyEditableValue}
      testID="property-tags-edit"
      onPress={onPress}
    >
      <Text style={propertyStyles.emptyEditableText}>{'\u2014'}</Text>
    </Pressable>
  )
}

function EditablePropertyRow({
  layoutProbe,
  noteId,
  onEditProperty,
  propertyDisplayModes,
  property,
}: {
  layoutProbe: MobileLayoutProbe
  noteId: string
  onEditProperty: (noteId: string, key: string, value: MobilePropertyValue) => void
  propertyDisplayModes?: Record<string, MobilePropertyDisplayMode> | null
  property: MobileProperty
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  const testId = `property-row-${testIdSegment(property.key)}`
  const display = mobilePropertyDisplay(
    property.key,
    property.value,
    {
      false: mobileText('inspector.properties.no'),
      true: mobileText('inspector.properties.yes'),
    },
    propertyDisplayModes,
  )

  return (
    <MobilePropertyRow
      label={property.label}
      layoutProbe={layoutProbe}
      layoutProbeId={`properties.row.${testIdSegment(property.key)}`}
      testID={testId}
      value={
        <Pressable
          accessibilityLabel={`${property.label}: ${display.text}`}
          accessibilityRole="button"
          style={propertyStyles.editableValue}
          testID={`${testId}-edit`}
          onPress={() => onEditProperty(noteId, property.key, property.value)}
        >
          <EditablePropertyValueDisplay display={display} />
        </Pressable>
      }
    />
  )
}

function EditablePropertyValueDisplay({ display }: { display: MobilePropertyDisplay }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyDisplayStyles } = themeStyles
  if (display.kind === 'list' && display.listItems.length > 0) {
    return (
      <View style={propertyDisplayStyles.listValue}>
        {display.listItems.map((item) => (
          <MobileChip key={item} label={item} tone={tagTone(item)} />
        ))}
      </View>
    )
  }

  if (display.kind === 'status') {
    return <MobileChip label={display.text} tone={statusTone(display.text)} />
  }

  if (display.kind === 'color') {
    return <EditableColorValue colorValue={display.colorValue} text={display.text} />
  }

  return (
    <Text numberOfLines={1} style={editablePropertyTextStyle(themeStyles, display.kind)}>
      {display.text}
    </Text>
  )
}

function EditableColorValue({ colorValue, text }: { colorValue?: string; text: string }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyDisplayStyles, propertyStyles } = themeStyles
  return (
    <View style={propertyDisplayStyles.colorValue}>
      <View
        style={[
          propertyDisplayStyles.colorSwatch,
          colorValue ? { backgroundColor: colorValue } : null,
        ]}
      />
      <Text numberOfLines={1} style={propertyStyles.editableText}>
        {text}
      </Text>
    </View>
  )
}

function editablePropertyTextStyle(themeStyles: ReturnType<typeof createPropertyPanelStyles>, kind: MobilePropertyDisplay['kind']) {
  const { propertyStyles, propertyDisplayStyles } = themeStyles
  return [
    propertyStyles.editableText,
    kind === 'number' ? propertyDisplayStyles.numberText : null,
    kind === 'url' ? propertyDisplayStyles.urlText : null,
  ]
}

function PropertiesEmptyState() {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { emptyStateStyles } = themeStyles
  return (
    <View style={emptyStateStyles.emptyState}>
      <Text style={emptyStateStyles.emptyTitle}>{mobileText('inspector.empty.noNoteSelected')}</Text>
      <Text style={emptyStateStyles.emptyText}>{mobileText('inspector.empty.noProperties')}</Text>
    </View>
  )
}

function PlaceholderPropertyRow({
  layoutProbe,
  onPress,
  slot,
}: {
  layoutProbe: MobileLayoutProbe
  onPress: () => void
  slot: MobileInspectorPropertySlot
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  const sourceSegment = slot.source === 'typeDerived' ? 'type-derived' : 'suggested'
  const testID = `property-placeholder-${sourceSegment}-${testIdSegment(slot.key)}`

  return (
    <MobilePropertyRow
      accessibilityLabel={slot.label}
      label={slot.label}
      layoutProbe={layoutProbe}
      layoutProbeId={`properties.placeholder.${testIdSegment(slot.key)}`}
      testID={testID}
      onPress={onPress}
      value={
        <View pointerEvents="none" style={propertyStyles.placeholderAddValue} testID={`${testID}-add`}>
          <Text numberOfLines={1} style={propertyStyles.placeholderValue}>
            {mobileInspectorPlaceholderActionLabel('property')}
          </Text>
        </View>
      }
    />
  )
}

type PropertySectionProps = {
  children: ReactNode
  label: string
  labelVariant?: 'default' | 'placeholder'
  layoutProbe?: MobileLayoutProbe
  layoutProbeId?: string
  testID?: string
}

function PropertySection(props: PropertySectionProps) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  const metricId = props.layoutProbeId ?? props.testID

  return (
    <View {...propertyProbe(props.layoutProbe, metricId, 'row')} style={propertyStyles.sectionRow} testID={props.testID}>
      <Text
        {...propertyProbe(props.layoutProbe, metricId, 'label')}
        style={[propertyStyles.sectionLabel, props.labelVariant === 'placeholder' ? propertyStyles.placeholderLabel : null]}
        testID={props.testID ? `${props.testID}-label` : undefined}
      >
        {props.label}
      </Text>
      <View
        {...propertyProbe(props.layoutProbe, metricId, 'value')}
        style={propertyStyles.sectionValue}
        testID={props.testID ? `${props.testID}-value` : undefined}
      >
        {props.children}
      </View>
    </View>
  )
}

function PropertyActionRow({
  label,
  layoutProbe,
  layoutProbeId,
  onPress,
  testID,
}: {
  label: string
  layoutProbe?: MobileLayoutProbe
  layoutProbeId?: string
  onPress: () => void
  testID: string
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { actionStyles } = themeStyles
  const mobileColors = useMobileColors()
  const visibleLabel = label.replace(/^\+\s*/, '')
  const metricId = layoutProbeId ?? testID

  return (
    <Pressable
      {...propertyProbe(layoutProbe, metricId, 'row')}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={actionStyles.row}
      testID={testID}
      onPress={onPress}
    >
      <View {...propertyProbe(layoutProbe, metricId, 'label')} pointerEvents="none" style={actionStyles.label}>
        <View style={actionStyles.iconSlot}>
          <Plus color={mobileColors.textFaint} size={14} />
        </View>
        <Text numberOfLines={1} style={actionStyles.text}>
          {visibleLabel}
        </Text>
      </View>
      <View {...propertyProbe(layoutProbe, metricId, 'value')} pointerEvents="none" style={actionStyles.value} />
    </Pressable>
  )
}

function PlaceholderRelationshipSection({
  layoutProbe,
  onPress,
  slot,
}: {
  layoutProbe: MobileLayoutProbe
  onPress: () => void
  slot: MobileInspectorRelationshipSlot
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles, actionStyles } = themeStyles
  const mobileColors = useMobileColors()
  const sourceSegment = slot.source === 'typeDerived' ? 'type-derived' : 'suggested'
  const testID = `relationship-placeholder-${sourceSegment}-${testIdSegment(slot.key)}`

  return (
    <PropertySection
      label={slot.label}
      labelVariant="placeholder"
      layoutProbe={layoutProbe}
      layoutProbeId={`properties.relationship-placeholder.${testIdSegment(slot.key)}`}
      testID={testID}
    >
      <Pressable
        accessibilityLabel={mobileText('inspector.relationship.add')}
        accessibilityRole="button"
        style={propertyStyles.placeholderRelationshipButton}
        testID={`${testID}-add`}
        onPress={onPress}
      >
        <View style={actionStyles.label}>
          <View style={actionStyles.iconSlot}>
            <Plus color={mobileColors.textFaint} size={14} />
          </View>
          <Text numberOfLines={1} style={[actionStyles.text, propertyStyles.placeholderButtonText]}>
            {mobileInspectorPlaceholderActionLabel('relationship')}
          </Text>
        </View>
      </Pressable>
    </PropertySection>
  )
}

function RelationshipValues(props: {
  layoutProbe: MobileLayoutProbe
  noteId: string
  relationship: MobileRelationship
  typeDefinitions?: MobileTypeDefinitions
  onRemoveRelationship: (noteId: string, key: string, ref: string) => void
  onEnterNeighborhood?: (noteId: string) => void
  onSelectNote: (noteId: string) => void
}) {
  const { layoutProbe, noteId, onRemoveRelationship, onEnterNeighborhood, onSelectNote, relationship, typeDefinitions } = props
  const colors = useMobileColors()
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { relationshipStyles } = themeStyles
  const rowSegments = mobileRelationshipValueMetricSegments(relationship.values)

  return (
    <View style={relationshipStyles.values}>
      {relationship.values.map((value, valueIndex) => {
        const rowSegment = rowSegments[valueIndex] ?? relationshipValueSegment(value, valueIndex)

        return (
          <View
            key={rowSegment}
            {...propertyProbe(layoutProbe, `properties.relationship.${rowSegment}`, 'row')}
            style={[relationshipStyles.row, { backgroundColor: noteTypeSoftColor(value.typeTone, colors) }]}
            testID={`relationship-row-${rowSegment}`}
          >
            <Pressable
              accessibilityLabel={value.title}
              accessibilityRole="button"
              disabled={!value.id}
              {...propertyProbe(layoutProbe, `properties.relationship.${rowSegment}`, 'target')}
              style={relationshipStyles.openTarget}
              testID={`relationship-row-${rowSegment}-open`}
              onPress={() => {
                if (!value.id) return
                onSelectNote(value.id)
              }}
              onLongPress={() => {
                if (value.id) onEnterNeighborhood?.(value.id)
              }}
            >
              <RelationshipValueLabel value={value} typeDefinitions={typeDefinitions} layoutProbe={layoutProbe} rowSegment={rowSegment} />
            </Pressable>
            <Pressable
              accessibilityLabel={mobileText('common.remove')}
              accessibilityRole="button"
              hitSlop={8}
              style={relationshipStyles.remove}
              testID={`relationship-row-${rowSegment}-remove`}
              onPress={() => {
                if (relationship.key && value.ref) onRemoveRelationship(noteId, relationship.key, value.ref)
              }}
            >
              <X color={noteTypeColor(value.typeTone)} size={desktopRelationshipParity.removeIconSize} weight="bold" />
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}

function RelationshipValueLabel(props: {
  layoutProbe: MobileLayoutProbe
  rowSegment: string
  typeDefinitions?: MobileTypeDefinitions
  value: MobileRelationship['values'][number]
}) {
  const { layoutProbe, rowSegment, typeDefinitions, value } = props
  const colors = useMobileColors()
  const { relationshipStyles } = useMobileStyles(createPropertyPanelStyles)
  return (
    <>
      <MobileTypeIcon size={desktopRelationshipParity.iconSize} tone={value.typeTone} type={value.type} typeDefinitions={typeDefinitions} />
      <Text
        numberOfLines={1}
        {...propertyProbe(layoutProbe, `properties.relationship.${rowSegment}`, 'text')}
        style={[relationshipStyles.text, { color: noteTypeColor(value.typeTone, colors) }]}
        testID={`relationship-row-${rowSegment}-text`}
      >
        {value.title}
      </Text>
    </>
  )
}

function propertyProbe(layoutProbe: MobileLayoutProbe | undefined, metricId: string | undefined, part: string) {
  return metricId ? probeProps(layoutProbe, `${metricId}.${part}`) : {}
}

function ReferenceGroups({
  groups,
  layoutProbe,
  typeDefinitions,
  onSelectNote,
}: {
  groups: MobileNeighborhoodGroup[]
  layoutProbe?: MobileLayoutProbe
  typeDefinitions?: MobileTypeDefinitions
  onSelectNote: (noteId: string) => void
}) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { referenceStyles } = themeStyles
  if (groups.length === 0) return null

  return (
    <View style={referenceStyles.container} testID="inspector-reference-groups">
      {groups.map((group) => (
        <PropertySection
          key={`${group.source}-${group.id}`}
          label={referenceGroupLabel(group)}
          testID={`inspector-reference-group-${group.id}`}
        >
          <ReferenceValues
            group={group}
            layoutProbe={layoutProbe}
            typeDefinitions={typeDefinitions}
            onSelectNote={onSelectNote}
          />
        </PropertySection>
      ))}
    </View>
  )
}

function ReferenceValues({
  group,
  layoutProbe,
  typeDefinitions,
  onSelectNote,
}: {
  group: MobileNeighborhoodGroup
  layoutProbe?: MobileLayoutProbe
  typeDefinitions?: MobileTypeDefinitions
  onSelectNote: (noteId: string) => void
}) {
  const colors = useMobileColors()
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { relationshipStyles, referenceStyles } = themeStyles
  return (
    <View style={relationshipStyles.values}>
      {group.notes.map((note) => (
        <Pressable
          key={`${group.id}-${note.id}`}
          accessibilityLabel={note.title}
          accessibilityRole="button"
          {...propertyProbe(layoutProbe, referenceRowMetricId(group, note), 'row')}
          style={[referenceStyles.row, { backgroundColor: noteTypeSoftColor(note.typeTone, colors) }]}
          testID={`inspector-reference-row-${testIdSegment(note.title)}`}
          onPress={() => onSelectNote(note.id)}
        >
          <MobileTypeIcon
            fileKind={note.fileKind}
            size={mobileInspectorReferenceRowLayoutContract.iconSize}
            tone={note.typeTone}
            type={note.type}
            typeDefinitions={typeDefinitions}
          />
          <Text numberOfLines={1} style={[referenceStyles.text, { color: noteTypeColor(note.typeTone, colors) }]}>
            {note.title}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function referenceGroupLabel(group: MobileNeighborhoodGroup) {
  return group.source === 'instances' ? `${group.label} (${group.notes.length})` : group.label
}

function referenceRowMetricId(group: MobileNeighborhoodGroup, note: MobileNote) {
  return `properties.reference.${testIdSegment(group.id)}.${testIdSegment(note.title)}`
}

function relationshipHeading(relationship: MobileRelationship): string {
  if (relationship.kind === 'custom') {
    return relationship.label ?? 'Custom'
  }

  if (relationship.kind === 'belongsTo') return 'Belongs to'
  if (relationship.kind === 'has') return 'Has'
  return 'Related to'
}

function TagWrap({ labels }: { labels: string[] }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  return (
    <View style={propertyStyles.tagWrap} testID="property-tags-wrap">
      {labels.map((label) => (
        <MobileChip key={label} label={label} tone={tagTone(label)} />
      ))}
    </View>
  )
}

function WorkspaceBadge({ label }: { label: string }) {
  const themeStyles = useMobileStyles(createPropertyPanelStyles)
  const { propertyStyles } = themeStyles
  return <Text style={propertyStyles.workspaceBadge}>{label}</Text>
}

function relationshipValueSegment(value: MobileRelationship['values'][number], index: number) {
  return mobileRelationshipValueMetricSegments([value])[0] ?? `relationship-${index + 1}`
}

function testIdSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
