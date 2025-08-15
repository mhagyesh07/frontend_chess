import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChessBoard from '../components/ChessBoard';
import { Chess } from 'chess.js';

describe('Drag and Drop Functionality Tests', () => {
  const mockOnMove = jest.fn();
  const chess = new Chess();
  
  beforeEach(() => {
    mockOnMove.mockClear();
  });

  test('should handle drag start on pieces', () => {
    render(
      <ChessBoard 
        board={chess.board()} 
        playerRole="w" 
        onMove={mockOnMove} 
      />
    );
    
    // Find a white pawn (should be draggable for white player)
    const whitePawn = screen.getAllByText('♙')[0];
    
    // Create drag event
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    
    fireEvent(whitePawn, dragStartEvent);
    
    // Should set draggable attribute
    expect(whitePawn.closest('[draggable]')).toHaveAttribute('draggable', 'true');
  });

  test('should not allow dragging opponent pieces', () => {
    render(
      <ChessBoard 
        board={chess.board()} 
        playerRole="w" 
        onMove={mockOnMove} 
      />
    );
    
    // Find a black pawn (should not be draggable for white player)
    const blackPawn = screen.getAllByText('♟')[0];
    
    // Black pieces should not be draggable for white player
    expect(blackPawn.closest('[draggable]')).toHaveAttribute('draggable', 'false');
  });

  test('should handle drop events and emit moves', async () => {
    render(
      <ChessBoard 
        board={chess.board()} 
        playerRole="w" 
        onMove={mockOnMove} 
      />
    );
    
    // Simulate drag and drop from e2 to e4
    const sourceSquare = screen.getByTestId('square-6-4'); // e2 in 0-indexed
    const targetSquare = screen.getByTestId('square-4-4'); // e4 in 0-indexed
    
    // Drag start
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    
    fireEvent(sourceSquare, dragStartEvent);
    
    // Drop
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    
    fireEvent(targetSquare, dropEvent);
    
    await waitFor(() => {
      expect(mockOnMove).toHaveBeenCalledWith({
        from: 'e2',
        to: 'e4'
      });
    });
  });

  test('should handle drag over events', () => {
    render(
      <ChessBoard 
        board={chess.board()} 
        playerRole="w" 
        onMove={mockOnMove} 
      />
    );
    
    const targetSquare = screen.getByTestId('square-4-4');
    
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true
    });
    
    fireEvent(targetSquare, dragOverEvent);
    
    // Should prevent default to allow drop
    expect(dragOverEvent.defaultPrevented).toBe(true);
  });

  test('should not allow moves when not player turn', () => {
    const chessAfterMove = new Chess();
    chessAfterMove.move('e4'); // White moves, now it's black's turn
    
    render(
      <ChessBoard 
        board={chessAfterMove.board()} 
        playerRole="w" 
        onMove={mockOnMove} 
      />
    );
    
    // White pieces should not be draggable when it's black's turn
    const whitePawn = screen.getAllByText('♙')[0];
    expect(whitePawn.closest('[draggable]')).toHaveAttribute('draggable', 'false');
  });

  test('should flip board for black player', () => {
    render(
      <ChessBoard 
        board={chess.board()} 
        playerRole="b" 
        onMove={mockOnMove} 
      />
    );
    
    const chessBoard = screen.getByTestId('chess-board');
    
    // Board should have rotation class for black player
    expect(chessBoard).toHaveClass('rotate-180');
  });
});