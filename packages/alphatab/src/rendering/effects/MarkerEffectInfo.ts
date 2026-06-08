import type { Beat } from '@coderline/alphatab/model/Beat';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

class GuitarWithJimmyMarkerGlyph extends TextGlyph {
    private readonly _lift: number;

    public constructor(x: number, y: number, text: string, font: TextGlyph['font'], align: TextAlign, lift: number) {
        super(x, y, text, font, align);
        this._lift = lift;
    }

    public override doLayout(): void {
        super.doLayout();
        this.y -= this._lift;
        this.height += Math.max(0, this._lift);
    }
}

type GuitarWithJimmyMarkerDisplaySettings = {
    gwjMarkerLift?: number | string | null;
};

/**
 * @internal
 */
export class MarkerEffectInfo extends EffectInfo {
    private static readonly _defaultMarkerLift = 8;

    public get notationElement(): NotationElement {
        return NotationElement.EffectMarker;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.isSectionStart
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const displaySettings = renderer.settings.display as unknown as GuitarWithJimmyMarkerDisplaySettings;
        const manualLift = MarkerEffectInfo._numberOrNull(displaySettings.gwjMarkerLift);
        return new GuitarWithJimmyMarkerGlyph(
            0,
            0,
            !beat.voice.bar.masterBar.section!.marker
                ? beat.voice.bar.masterBar.section!.text
                : `[${beat.voice.bar.masterBar.section!.marker}] ${beat.voice.bar.masterBar.section!.text}`,
            renderer.resources.elementFonts.get(NotationElement.EffectMarker)!,
            TextAlign.Left,
            manualLift ?? MarkerEffectInfo._defaultMarkerLift
        );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }

    private static _numberOrNull(value: number | string | null | undefined): number | null {
        if (value === null || value === undefined || value === '' || value === 'auto') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
}
