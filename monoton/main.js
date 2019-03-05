function intToFract(int) {
    return new algebra.Fraction(int, 1);
}
function toTex(num) {
    if (num instanceof algebra.Fraction) {
        return num.toTex();
    }
    return num.toString();
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementsByTagName("form")[0];
    const input = document.querySelector("form input[type=text]");
    const header = document.querySelector("table thead");
    const contents = document.querySelector("#content");
    const arrows = document.querySelector("#arrow");
    const extrema = document.querySelector("#extremum");
    const calculations = document.querySelector("#calculation");
    form.onsubmit = event => {
        form.style["display"] = "none";
        event.preventDefault();
        const y = math.parse(input.value);
        const f = algebra.parse(y.toString());
        document.getElementById("y").innerHTML = "$$\\mathrm{f}(x)=" + toTex(y) + "$$";
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "y"]);
        const y_ = math.derivative(y, "x");
        document.getElementById("y_").innerHTML = "$$\\mathrm{f}^{\\prime}(x)=" + toTex(y_) + "$$";
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "y_"]);
        const d = algebra.parse(y_.toString());
        let solution = new algebra.Equation(algebra.parse("0"), d).solveFor("x");
        if (!Array.isArray(solution)) {
            solution = [solution];
        }
        if (solution.length == 0) {
            return false;
        }
        console.log(solution);
        solution.sort();
        let gradients = [];
        let xs = [];
        for (let i = 0; i <= solution.length * 2; i++) {
            const head = document.createElement("th");
            let x;
            if (i == 0) {
                head.innerHTML = "$$x < " + toTex(solution[i]) + "$$";
                if (solution[i] > 0) {
                    x = intToFract(0);
                } else {
                    x = intToFract(Math.round(solution[i]) - 1);
                }
            } else if (i % 2 == 1) {
                head.innerHTML = "$$x=" + toTex(solution[(i - 1) / 2]) + "$$";
                x = solution[(i - 1) / 2];
            } else if (i == solution.length * 2) {
                head.innerHTML = "$$" + toTex(solution[i / 2 - 1]) + " < x$$";
                if (solution[i / 2 - 1] < 0) {
                    x = intToFract(0);
                } else {
                    x = intToFract(Math.round(solution[i / 2 - 1]) + 1);
                }
            } else {
                head.innerHTML = "$$" + toTex(solution[i / 2 - 1]) + " < x < " + toTex(solution[i / 2]) + "$$";
                if (solution[i / 2 - 1] < 0 && solution[i / 2] > 0) {
                    x = intToFract(0);
                } else if ((Math.floor(solution[i / 2 - 1]) + 1) < solution[i] && (solution[i / 2 - 1] % 1) != 0) {
                    x = intToFract(Math.floor(solution[i / 2 - 1]) + 1);
                } else if (Math.floor(solution[i / 2]) > solution[i / 2 - 1] && (solution[i / 2] % 1) != 0) {
                    x = intToFract(Math.floor(solution[i / 2]));
                } else {
                    x = new algebra.Fraction(solution[i / 2 - 1].numer, solution[i / 2 - 1].denom).add(solution[i / 2]).divide(2);
                }
            }
            head.setAttribute("id", "tableHead" + i);
            header.appendChild(head);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "tableHead" + i]);
            const content = document.createElement("td");
            const y__ = d.eval({"x": x});
            content.innerHTML = "$$\\mathrm{f}^{\\prime}(" + toTex(x) + ")=" + toTex(y__) + "$$";
            content.setAttribute("id", "tableContent" + i);
            contents.appendChild(content);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "tableContent" + i]);
            const arrow = document.createElement("td");
            let f = parseFloat(y__.toString());
            if (f < 0) {
                arrow.innerHTML = "&#8600;";
                gradients.push(-1);
            } else if (f > 0) {
                arrow.innerHTML = "&#8599;";
                gradients.push(1);
            } else if (f == 0) {
                arrow.innerHTML = "&#8594;";
                gradients.push(0);
            }
            xs.push(x);
            arrows.appendChild(arrow);
        }
        console.log(xs);
        for (let i = 0; i < gradients.length; i++) {
            if (gradients[i] == 0) {
                const extremum = document.createElement("td");
                extremum.setAttribute("id", "extremum" + i);
                const calculation = document.createElement("span");
                console.log(xs[i]);
                let y_ = f.eval({"x": xs[i]});
                calculation.innerHTML = "$$\\mathrm{f}(" + toTex(xs[i]) + ")=" + toTex(y_) + "$$";
                calculation.setAttribute("id", "calculation" + i);
                if (gradients[i - 1] < 0 && gradients[i + 1] > 0) {
                    extremum.innerHTML = "$$Tiefpunkt(" + toTex(xs[i]) + "|" + toTex(y_) + ")$$";
                } else if (gradients[i - 1] > 0 && gradients[i + 1] < 0) {
                    extremum.innerHTML = "$$Hochpunkt(" + toTex(xs[i]) + "|" + toTex(y_) + ")$$"
                } else {
                    extremum.innerHTML = "$$Sattelpunkt(" + toTex(xs[i]) + "|" + toTex(y_) + ")$$"
                }
                calculations.appendChild(calculation);
                extrema.appendChild(extremum);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "calculation" + i]);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "extremum" + i]);
            } else {
                extrema.appendChild(document.createElement("td"));
            }
        }
        return false;
    };
});