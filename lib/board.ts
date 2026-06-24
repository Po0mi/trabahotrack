import { supabase } from "./supabase";

export const boardApi = {
  /**
   * Creates a new board and returns the board_id
   */
  async createBoard(accessToken: string): Promise<string> {
    const { data, error } = await supabase.rpc("create_board", {
      p_access_token: accessToken,
    });

    if (error) {
      console.error("Supabase create_board error:", error);
      throw new Error(error.message);
    }

    return data; // Returns the new board UUID
  },
};
