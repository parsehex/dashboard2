<template>
	<div class="spreadsheet">
		<div ref="table" />
		<div class="controls">
			<ul class="sheets">
				<li
					v-for="s in sheets"
					:key="s"
					:class="{
						sheet: true,
						active: sheet === s,
					}"
					@click="changeSheet(s)"
				>
					{{ s }}
				</li>
			</ul>
			<btn type="info" @click.capture="download">
				<icon type="download" :size="20" color="white" />
			</btn>
		</div>
	</div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import Tabulator from 'tabulator-tables';
import { saveReport } from '@/lib/io';
import { parse } from 'date-fns';
import { clone } from '@/lib/utils';

Tabulator.prototype.extendModule('sort', 'sorters', {
	month: (a: string, b: string) => {
		const aD = parse(a, 'MMMM, yyyy', new Date()).getTime();
		const bD = parse(b, 'MMMM, yyyy', new Date()).getTime();
		return aD - bD;
	},
});
Tabulator.prototype.extendModule('format', 'formatters', {
	percent: (cell, formatterParams?) => {
		const precision = formatterParams?.precision || 1;
		const v = cell.getValue();
		if (v !== 0 && !v) return v;
		return (+v * 100).toFixed(precision) + '%';
	},
});

interface Cols {
	[sheetName: string]: TabulatorColumnDefinition[];
}
export default defineComponent({
	name: 'Spreadsheet',
	props: {
		data: { type: Object as PropType<SpreadsheetData>, required: true },
		reportType: { type: String as PropType<ReportType>, required: true },
		columns: { type: Object as PropType<Cols>, required: true },
		sheet: {
			type: String as PropType<keyof SpreadsheetData>,
			required: true,
		},
		fileName: {
			type: String,
			required: true,
		},
		downloadTo: {
			type: String,
			required: true,
		},
	},
	emits: ['update:sheet'],
	setup(props) {
		const sheets = computed(() => Object.keys(props.data));
		return { sheets };
	},
	data: () => ({
		table: null as typeof Tabulator,
	}),
	updated() {
		this.table?.clearData();
		this.table?.setColumns(this.columns[this.sheet]);
		this.table?.setData(this.data[this.sheet]);
		this.table?.redraw(true);
	},
	mounted() {
		const table = this.$refs['table'] as HTMLDivElement;
		this.table = new Tabulator(table, {
			maxHeight: Math.floor(window.innerHeight) - table.offsetTop - 50, // this enables the Virtual DOM
			data: this.data[this.sheet],
			columns: this.columns[this.sheet],
			responsiveLayout: true,
			autoResize: true,
		});
	},
	methods: {
		changeSheet(sheet: string) {
			this.$emit('update:sheet', sheet);
		},
		async download() {
			const thisData = clone(this.data);

			console.log(thisData);
			await saveReport(thisData, this.fileName, this.reportType, this.downloadTo);
		},
	},
});
</script>

<style lang="scss">
.spreadsheet {
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: space-between;

		.btn {
			height: 100%;
		}
	}

	.sheets {
		list-style-type: none;
		padding: 0;
	}

	ul.sheets li.sheet {
		padding: 6px;
		border: 1px solid gray;
		border-top-width: 0;
		border-right-width: 0;
		margin-bottom: 2px;
		cursor: pointer;
		display: inline-block;
		user-select: none;

		&:first-of-type {
			border-top-left-radius: 5px;
			border-bottom-left-radius: 5px;
		}
		&:last-of-type {
			border-right-width: 1px;
			border-top-right-radius: 5px;
			border-bottom-right-radius: 5px;
		}

		&.active {
			font-weight: bold;
		}
	}
}
</style>
