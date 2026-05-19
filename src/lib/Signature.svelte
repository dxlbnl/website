<script lang="ts">
	import { Grid, Rule, Stack, Text } from '@dxlbnl/ui';
</script>

<Rule style="margin-bottom:var(--u2)" />
<Grid cols={2} gap="md">
	<Stack gap="xs">
		<Text variant="mono" size="xs" color="faint">// SIGNED</Text>
		<Text variant="lede" color="ink">— Dexter, in the lab</Text>
	</Stack>
	<Stack gap="xs">
		<Text variant="mono" size="xs" color="faint">// SHIPPED BY</Text>
		<Text variant="lede" color="ink">
			DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
		</Text>
	</Stack>
</Grid>
