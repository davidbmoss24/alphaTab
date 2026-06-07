import type { Beat } from '@coderline/alphatab/model/Beat';
import { Font } from '@coderline/alphatab/model/Font';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

class UnderTextGlyph extends TextGlyph {
    private static readonly _topPadding = 7;

    public override doLayout(): void {
        super.doLayout();
        this.y += UnderTextGlyph._topPadding;
        this.height += UnderTextGlyph._topPadding;
    }
}

/**
 * @internal
 */
export class UnderTextEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectUnderText;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return !!beat.underText;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const baseFont = renderer.resources.elementFonts.get(NotationElement.EffectUnderText)!;
        const font = beat.underTextSize > 0
            ? Font.withFamilyList(baseFont.families, beat.underTextSize, baseFont.style, baseFont.weight)
            : baseFont;
        return new UnderTextGlyph(
            0,
            0,
            beat.underText!,
            font,
            TextAlign.Center
        );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
