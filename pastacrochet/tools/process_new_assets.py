"""Prepare the selected Midjourney exports for the alternate game art page.

The source files in assets/new are never changed. Scene images are copied with
semantic names; sprite sheets are divided on their regular grids and their mint
backgrounds are converted to a soft alpha matte.
"""

from pathlib import Path
from shutil import copy2
from time import sleep

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "new"
OUTPUT = ROOT / "assets" / "v2"


def save_png(image: Image.Image, destination: Path) -> None:
    """Save through a sibling temp file so a live preview never sees half a PNG."""
    temporary = destination.with_name(destination.stem + ".writing.png")
    image.save(temporary, optimize=True)
    for attempt in range(5):
        try:
            temporary.replace(destination)
            return
        except OSError:
            if attempt == 4:
                raise
            sleep(0.12)


def source_named(fragment: str) -> Path:
    matches = [p for p in SOURCE.glob("*.png") if fragment in p.name]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one source matching {fragment!r}, found {len(matches)}")
    return matches[0]


def copy_scene(fragment: str, output_name: str) -> None:
    copy2(source_named(fragment), OUTPUT / output_name)


def mint_alpha(image: Image.Image, inner: float = 24, outer: float = 68) -> Image.Image:
    """Remove the sampled mint backdrop while retaining painted edge texture."""
    rgba = image.convert("RGBA")
    rgb = np.asarray(rgba, dtype=np.float32)[..., :3]
    h, w = rgb.shape[:2]
    band = max(3, min(h, w) // 40)
    border = np.concatenate(
        [
            rgb[:band].reshape(-1, 3),
            rgb[-band:].reshape(-1, 3),
            rgb[:, :band].reshape(-1, 3),
            rgb[:, -band:].reshape(-1, 3),
        ],
        axis=0,
    )
    key = np.median(border, axis=0)
    distance = np.sqrt(np.sum((rgb - key) ** 2, axis=2))
    alpha = np.clip((distance - inner) / (outer - inner), 0, 1)
    alpha = Image.fromarray(np.uint8(alpha * 255), "L").filter(ImageFilter.GaussianBlur(0.8))
    rgba.putalpha(alpha)
    return rgba


def framed_square(image: Image.Image, size: int = 512, padding: float = 0.07) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda p: 255 if p >= 24 else 0).getbbox()
    if not bbox:
        return Image.new("RGBA", (size, size))
    item = image.crop(bbox)
    max_side = round(size * (1 - padding * 2))
    item.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size))
    canvas.alpha_composite(item, ((size - item.width) // 2, (size - item.height) // 2))
    return canvas


def framed_portrait(image: Image.Image, width: int = 960, height: int = 1200) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda p: 255 if p >= 24 else 0).getbbox()
    if not bbox:
        return Image.new("RGBA", (width, height))
    item = image.crop(bbox)
    item.thumbnail((round(width * 0.88), round(height * 0.90)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (width, height))
    canvas.alpha_composite(item, ((width - item.width) // 2, height - item.height - round(height * 0.04)))
    return canvas


def cut_sheet(fragment: str, columns: int, rows: int, names: list[str]) -> None:
    with Image.open(source_named(fragment)) as sheet:
        sheet = sheet.convert("RGB")
        for index, name in enumerate(names):
            row, column = divmod(index, columns)
            left = round(column * sheet.width / columns)
            top = round(row * sheet.height / rows)
            right = round((column + 1) * sheet.width / columns)
            bottom = round((row + 1) * sheet.height / rows)
            cell = sheet.crop((left, top, right, bottom))
            # Ignore a narrow slice of adjacent cells before background sampling.
            inset_x, inset_y = max(2, cell.width // 80), max(2, cell.height // 80)
            cell = cell.crop((inset_x, inset_y, cell.width - inset_x, cell.height - inset_y))
            save_png(framed_square(mint_alpha(cell)), OUTPUT / name)


def cut_character(fragment: str, output_name: str) -> None:
    with Image.open(source_named(fragment)) as image:
        save_png(framed_portrait(mint_alpha(image, inner=22, outer=64)), OUTPUT / output_name)


def cut_square_subject(fragment: str, output_name: str) -> None:
    with Image.open(source_named(fragment)) as image:
        save_png(framed_square(mint_alpha(image, inner=22, outer=64), size=768, padding=0.04), OUTPUT / output_name)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    # Complete scenes and interface backdrops.
    copy_scene("news___--chaos_15_--ar_9151", "menu_bg.png")
    copy_scene("news_90169_--chaos_15", "setup_bg.png")
    copy_scene("empty_street_lo_9da67fd1", "story1.png")
    copy_scene("50c6f346-afa7-463c", "story2.png")
    copy_scene("news__CORA__--no_readable", "story3.png")
    copy_scene("news_httpss.mj.runkseT5GvLExw", "dialogBg.png")
    copy_scene("4fab6f1f-4803-4451", "dialogSay.png")
    cut_square_subject("0950d093-5271-45ad-a7e1-9accbb638af0_0", "home_logo.png")
    copy_scene("ccbae317-a74d-4c84-9244-3bc793eb5625", "order_menu_bg.png")

    # Characters. The owl was not included in this generation batch, so the
    # alternate config deliberately leaves that one pointing at the old asset.
    cut_character("chao_276e9703", "char_shulei.png")
    cut_character("chao_5089d2d7", "char_wenhua.png")
    cut_character("chao_5e84ea1e", "char_manshu.png")
    cut_character("chao_bdb82681", "char_feili.png")
    cut_character("news__SUZI_", "char_suzi.png")
    cut_character("chao_816da2bd", "char_nuangua.png")
    cut_character("news__80_--no_text", "chef_cat.png")
    cut_character("news__CORA_80", "chef_koala.png")

    cut_sheet(
        "food_icon_sprite_sheet_4_",
        4,
        2,
        [
            "sauce_red.png",
            "sauce_white.png",
            "sauce_green.png",
            "sauce_aglio.png",
            "sauce_pink.png",
            "sauce_soda.png",
            "sauce_squid.png",
        ],
    )
    cut_sheet(
        "d5a1b418-c658-4b16",
        5,
        2,
        [
            "topping_tomato.png",
            "topping_Calamari.png",
            "topping_basil.png",
            "topping_cheese.png",
            "topping_mushroom.png",
            "topping_blueberry.png",
            "topping_bacon.png",
            "topping_broccoli.png",
            "topping_caviari.png",
        ],
    )
    cut_sheet(
        "a611ada9-a00b-420f",
        5,
        2,
        [
            "pattern_d012.png",
            "pattern_d032.png",
            "pattern_circle1.png",
            "pattern_d004.png",
            "pattern_star.png",
            "pattern_circle2.png",
            "pattern_hexagon.png",
            "pattern_sakura.png",
            "pattern_flower1.png",
            "pattern_flower2.png",
        ],
    )
    cut_sheet(
        "UI_icon_sprite_sheet_4_",
        4,
        4,
        [
            "serve.png",
            "combo.png",
            "versus.png",
            "mascot_yarn.png",
            "diff_fire1.png",
            "lead_crown.png",
            "grade_perfect.png",
            "grade_ok.png",
            "grade_bad.png",
            "grade_miss.png",
        ],
    )

    # Assets that were not regenerated are copied so every v2 UI lookup has a
    # stable local fallback without changing the original directory.
    for name in [
        "logo.png",
        "done_raw.png",
        "done_almost.png",
        "done_perfect.png",
        "done_over.png",
        "rank_rookie.png",
        "rank_bronze.png",
        "rank_silver.png",
        "rank_gold.png",
        "rank_legend.png",
        "rank_champion.png",
        "result_tie.png",
        "result_win.png",
    ]:
        fallback = ROOT / "assets" / name
        if fallback.exists():
            copy2(fallback, OUTPUT / name)


if __name__ == "__main__":
    main()
