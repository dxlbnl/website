<script lang="ts">
	import { Rule, Spread, Stack, Text } from '@dxlbnl/ui';
</script>

<Rule />
<Spread gap="md">
	<Stack gap="xs">
		<Text variant="eyebrow">// SIGNED</Text>
		<Text variant="lede" color="ink">— Dexter, in the lab</Text>
	</Stack>
	<Stack gap="xs">
		<Text variant="eyebrow">// SHIPPED BY</Text>
		<Text variant="lede" color="ink">
			DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
		</Text>
	</Stack>
</Spread>
