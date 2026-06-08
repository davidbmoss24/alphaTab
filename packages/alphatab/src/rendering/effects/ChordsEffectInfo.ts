import type { Beat } from '@coderline/alphatab/model/Beat';
import { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { ChordDiagramGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramGlyph';

class GuitarWithJimmyChordNameGlyph extends TextGlyph {
    public static readonly font = new Font('Arial, sans-serif', 22, FontStyle.Plain, FontWeight.Bold);
    private static readonly _slashMeasureNumberClearance = 10;
    private readonly _lift: number;
    private readonly _xOffset: number;
    private readonly _protectSlashMeasureNumber: boolean;

    public constructor(
        x: number,
        y: number,
        text: string,
        lift: number,
        xOffset: number,
        protectSlashMeasureNumber: boolean
    ) {
        super(x, y, text, GuitarWithJimmyChordNameGlyph.font, TextAlign.Center);
        this._lift = lift;
        this._xOffset = xOffset;
        this._protectSlashMeasureNumber = protectSlashMeasureNumber;
    }

    public override doLayout(): void {
        super.doLayout();
        this.y -= this._lift;
        this.height += Math.max(0, this._lift);
    }

    public applyPostAlignmentOffset(): void {
        const slashMeasureNumberOffset = this._protectSlashMeasureNumber
            ? Math.max(0, this.width / 2 - GuitarWithJimmyChordNameGlyph._slashMeasureNumberClearance)
            : 0;
        this.x += this._xOffset + slashMeasureNumberOffset;
    }
}

type GuitarWithJimmyChordNameDisplaySettings = {
    gwjChordNameLift?: number | string | null;
    gwjChordNameSlashLift?: number | string | null;
    gwjChordNamePickLift?: number | string | null;
    gwjChordNameDefaultLift?: number | string | null;
    gwjChordNameXOffset?: number | string | null;
    gwjChordNameSlashXOffset?: number | string | null;
};

type GuitarWithJimmyChordNamePlacement = {
    xOffset: number;
    protectSlashMeasureNumber: boolean;
};

/**
 * @internal
 */
export class ChordsEffectInfo extends EffectInfo {
    private static readonly _defaultLift = 8;
    private static readonly _slashOnlyLift = -12;
    private static readonly _withPickStrokeLift = 18;

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
        const lift = ChordsEffectInfo._resolveLift(renderer, beat);
        const placement = ChordsEffectInfo._resolvePlacement(renderer, beat);
        return showDiagram
            ? new ChordDiagramGlyph(0, 0, beat.chord!, NotationElement.EffectChordNames, true)
            : new GuitarWithJimmyChordNameGlyph(
                  0,
                  0,
                  beat.chord!.name,
                  lift,
                  placement.xOffset,
                  placement.protectSlashMeasureNumber
              );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }

    public override onAlignGlyphs(band: EffectBand): void {
        for (const glyph of band.iterateAllGlyphs()) {
            if (glyph instanceof GuitarWithJimmyChordNameGlyph) {
                glyph.applyPostAlignmentOffset();
            }
        }
    }

    private static _resolveLift(renderer: BarRendererBase, beat: Beat): number {
        const displaySettings = renderer.settings.display as unknown as GuitarWithJimmyChordNameDisplaySettings;
        const manualLift = ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNameLift);
        if (manualLift !== null) {
            return manualLift;
        }

        if (ChordsEffectInfo._barHasPickStroke(beat)) {
            return (
                ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNamePickLift) ??
                ChordsEffectInfo._withPickStrokeLift
            );
        }

        if (ChordsEffectInfo._barIsSlashOnly(beat)) {
            return ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNameSlashLift) ?? ChordsEffectInfo._slashOnlyLift;
        }

        return ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNameDefaultLift) ?? ChordsEffectInfo._defaultLift;
    }

    private static _numberOrNull(value: number | string | null | undefined): number | null {
        if (value === null || value === undefined || value === '' || value === 'auto') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    private static _resolvePlacement(renderer: BarRendererBase, beat: Beat): GuitarWithJimmyChordNamePlacement {
        const displaySettings = renderer.settings.display as unknown as GuitarWithJimmyChordNameDisplaySettings;
        const manualOffset = ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNameXOffset);
        if (manualOffset !== null) {
            return { xOffset: manualOffset, protectSlashMeasureNumber: false };
        }

        if (ChordsEffectInfo._barIsSlashOnly(beat)) {
            const slashOffset = ChordsEffectInfo._numberOrNull(displaySettings.gwjChordNameSlashXOffset);
            return slashOffset !== null
                ? { xOffset: slashOffset, protectSlashMeasureNumber: false }
                : { xOffset: 0, protectSlashMeasureNumber: true };
        }

        return { xOffset: 0, protectSlashMeasureNumber: false };
    }

    private static _barHasPickStroke(beat: Beat): boolean {
        return beat.voice.bar.voices.some(v => v.beats.some(b => b.pickStroke !== PickStroke.None));
    }

    private static _barIsSlashOnly(beat: Beat): boolean {
        const beats = beat.voice.bar.voices.flatMap(v => v.beats);
        return beats.length > 0 && beats.every(b => b.slashed);
    }
}
