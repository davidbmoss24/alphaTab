import type { Beat } from '@coderline/alphatab/model/Beat';
import { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { ChordDiagramGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramGlyph';

class GuitarWithJimmyChordNameGlyph extends TextGlyph {
    public static readonly font = new Font('Arial, sans-serif', 22, FontStyle.Plain, FontWeight.Bold);
    private readonly _lift: number;

    public constructor(x: number, y: number, text: string, lift: number) {
        super(x, y, text, GuitarWithJimmyChordNameGlyph.font, TextAlign.Center);
        this._lift = lift;
    }

    public override doLayout(): void {
        super.doLayout();
        this.y -= this._lift;
        this.height += this._lift;
    }
}

/**
 * @internal
 */
export class ChordsEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectChordNames;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.hasChord;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const showDiagram = beat.voice.bar.staff.track.score.stylesheet.globalDisplayChordDiagramsInScore;
        const displaySettings = renderer.settings.display as unknown as { gwjChordNameLift?: number };
        const lift = displaySettings.gwjChordNameLift ?? 18;
        return showDiagram
            ? new ChordDiagramGlyph(0, 0, beat.chord!, NotationElement.EffectChordNames, true)
            : new GuitarWithJimmyChordNameGlyph(0, 0, beat.chord!.name, lift);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
