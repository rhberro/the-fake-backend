import React, {useState, useEffect} from 'react';
import {render, Box, Text, useApp, useInput} from 'ink';

const Counter = () => {
  const [key, setKey] = useState<string>();

  const { exit } = useApp();
  
  useInput(
	(input, key) => {
	  setKey(input);

	  if (input === 'q') {
		exit();
	  }
	}
  )

  return <Box borderStyle="round" borderColor="green">
  <Text color="green">Last key was {key}</Text>
</Box>;
};

export const createInterface = () => {
  render(<Counter />);
}
