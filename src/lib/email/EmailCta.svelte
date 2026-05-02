<script lang="ts">
	type Props = { href: string; name: string; description: string; cta?: string };
	let { href, name, description, cta = 'Check it out' }: Props = $props();

	const sans = "'Inter Tight', Inter, ui-sans-serif, system-ui, sans-serif";
</script>

<!--
	<a> wrapping <table> is technically invalid HTML but universally handled
	by email clients — the standard pattern for fully-clickable email cards.
-->
<a {href} style="display:block;text-decoration:none;margin:28px 0;">
	<table
		width="100%"
		cellpadding="0"
		cellspacing="0"
		border="0"
		role="presentation"
		style="background:#ffb347;"
	>
		<tbody>
			<tr>
				<td style="padding:20px 24px;vertical-align:middle;">
					<div
						style="font-family:monospace;font-size:11px;letter-spacing:0.12em;color:#7a3f00;text-transform:uppercase;margin:0 0 4px;"
					>
						// THE HARDWARE
					</div>
					<div
						style="font-family:{sans};font-weight:500;font-size:17px;letter-spacing:-0.01em;color:#0a0a0a;margin:0 0 3px;"
					>
						{name}
					</div>
					<div style="font-family:{sans};font-size:14px;color:#3d2000;line-height:1.4;margin:0;">
						{description}
					</div>
				</td>
				<td style="padding:20px 24px;vertical-align:middle;white-space:nowrap;text-align:right;">
					<span
						style="font-family:monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0a0a0a;"
					>
						{cta} &rarr;
					</span>
				</td>
			</tr>
		</tbody>
	</table>
</a>
