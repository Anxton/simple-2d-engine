import { Game } from "./game/game";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const canvas2DContext = canvas.getContext("2d")!;

const buttonStartStopGame = document.getElementById("start-button") as HTMLButtonElement;
const entityCountSlider = document.getElementById("entity-count") as HTMLInputElement;
const buttonAddEntities = document.getElementById("add-entities-button") as HTMLButtonElement;
const buttonClearEntities = document.getElementById("clear-entities-button") as HTMLButtonElement;
const buttonTickStep = document.getElementById("tick-step-button") as HTMLButtonElement;
const buttonRender = document.getElementById("render-button") as HTMLButtonElement;

const game = new Game(canvas, canvas2DContext);

game.start();

const refreshStartButtonText = () => {
  buttonStartStopGame.innerText = !game.playing ? "Resume game" : "Pause game";
};

entityCountSlider.oninput = () => {
  entityCountSlider.previousElementSibling!.textContent = entityCountSlider.value;
};
buttonStartStopGame.onclick = () => {
  if (!game.playing) {
    game.start();
  } else {
    game.pause();
  }
  refreshStartButtonText();
};
buttonAddEntities.onclick = () => {
  for (let i = 0; i < parseInt(entityCountSlider.value); i++) {
    game.addRandomCircles();
  }
};
buttonClearEntities.onclick = () => {
  game.clearEntities();
};
buttonTickStep.onclick = () => {
  game.tickStep();
  refreshStartButtonText();
};
buttonRender.onclick = () => {
  game.render();
};
