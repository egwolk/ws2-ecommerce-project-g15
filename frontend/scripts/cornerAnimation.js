 function addCornerDecorations() {
    document.querySelectorAll(".product-card").forEach((container) => {
        // Create corner SVG elements
        const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];

        corners.forEach((position) => {
        const corner = document.createElement("div");
        corner.className = `corner ${position}`;

        // Use the plus symbol SVG
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("viewBox", "0 0 512 512");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        // Create plus symbol polygon
        const polygon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );
        polygon.setAttribute(
            "points",
            "448,224 288,224 288,64 224,64 224,224 64,224 64,288 224,288 224,448 288,448 288,288 448,288"
        );
        polygon.setAttribute("fill", "currentColor");

        svg.appendChild(polygon);
        corner.appendChild(svg);
        container.appendChild(corner);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    addCornerDecorations();
});

window.addCornerDecorations = addCornerDecorations;