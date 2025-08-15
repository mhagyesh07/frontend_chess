export const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    P: "♟",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };
  return unicodePieces[piece.type] || "";
};

export const convertPositionToChessNotation = (position) => {
  return `${String.fromCharCode(97 + position.col)}${8 - position.row}`;
};