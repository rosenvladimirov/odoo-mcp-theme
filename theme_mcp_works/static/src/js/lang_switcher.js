/** @odoo-module **/
// MCP Lang Switcher — slider follows hovered/active flag, smooth navigate

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.MCPLangSwitcher = publicWidget.Widget.extend({
    selector: ".s_mcp_lang_switcher",
    events: {
        "mouseenter .lsw-item": "_onHover",
        "mouseleave": "_onLeave",
        "click .lsw-item": "_onClick",
    },

    start() {
        this.$slider = this.$(".lsw-slider");
        this.$items = this.$(".lsw-item");
        this.activeIndex = this.$items.index(this.$(".lsw-item.is-active")) || 0;
        // Position slider on the active item after render
        this._moveSliderTo(this.activeIndex);
        // Re-position on resize (gap could change)
        this._onResize = this._onResize.bind(this);
        window.addEventListener("resize", this._onResize);
        return this._super.apply(this, arguments);
    },

    destroy() {
        window.removeEventListener("resize", this._onResize);
        this._super.apply(this, arguments);
    },

    _onResize() {
        this._moveSliderTo(this.activeIndex);
    },

    _onHover(ev) {
        const idx = this.$items.index(ev.currentTarget);
        if (idx >= 0) this._moveSliderTo(idx);
    },

    _onLeave() {
        // Snap back to the active language when mouse leaves the switcher
        this._moveSliderTo(this.activeIndex);
    },

    _onClick(ev) {
        // Animate slider to clicked, then navigate
        const idx = this.$items.index(ev.currentTarget);
        if (idx < 0) return;
        const $a = this.$items.eq(idx);
        const url = $a.data("url") || $a.attr("href");
        if (!url) return;
        ev.preventDefault();
        this._moveSliderTo(idx);
        // Tiny delay so visitor sees the slide before navigation
        setTimeout(() => { window.location.href = url; }, 280);
    },

    _moveSliderTo(idx) {
        if (!this.$slider.length || !this.$items.length) return;
        const $target = this.$items.eq(idx);
        const targetEl = $target[0];
        const switcherRect = this.el.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        // Detect orientation by comparing item Y deltas — vertical = stacked
        const isVertical = this.$items.length > 1 &&
            Math.abs(this.$items.eq(1)[0].getBoundingClientRect().top - this.$items.eq(0)[0].getBoundingClientRect().top) > 10;
        if (isVertical) {
            const offsetY = targetRect.top - switcherRect.top + (targetRect.height / 2) - (this.$slider[0].offsetHeight / 2);
            this.$slider.css({"top": `${offsetY}px`, "transform": "translateX(-50%)"});
        } else {
            const offsetX = targetRect.left - switcherRect.left + (targetRect.width / 2) - (this.$slider[0].offsetWidth / 2);
            this.$slider.css("transform", `translateX(${offsetX}px)`);
            this.$slider.css("width", `${targetRect.width}px`);
        }
    },
});

export default publicWidget.registry.MCPLangSwitcher;
