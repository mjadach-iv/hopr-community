import {
  Button,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Box,
  Tag,
  Skeleton,
} from '@chakra-ui/react'
import { CurrencyTag } from '../components/atoms/CurrencyTag'
import { SyncButton } from './atoms/SyncButton'
import { ActionType, setStaking, setSync, StateType } from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { useBlockNumber, useEthers } from '@usedapp/core'
import { Dispatch } from 'react'
import { EndProgramDateDays } from './atoms/ProgramDate'
import { BalanceWithCurrency } from './molecules/BalanceWithCurrency'
import { format } from 'timeago.js'

export const StakeXHoprTokens = ({
  XHOPRContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  XHOPRContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { chainId, library, account } = useEthers()
  const block = useBlockNumber()
  const colours = RPC_COLOURS[chainId]

  const timeDiff = (new Date().getTime() - +state.lastSync * 1000) / 1000 // to seconds
  const FACTOR_DENOMINATOR = 1e12
  const baseBoost = 5787 / FACTOR_DENOMINATOR
  const bonusBoost = state.totalAPRBoost / FACTOR_DENOMINATOR
  const totalBoost = bonusBoost + baseBoost
  const estimatedRewards = timeDiff * (+state.stakedHOPRTokens * totalBoost)

  return (
    <>
      <Box d="flex" justifyContent="space-between" mb="10px">
        <Box d="flex" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            Stake xHOPR tokens
          </Text>
          <Text ml="10px" fontSize="sm" fontWeight="400">
            You won’t be able to recover your stake until the staking program
            ends.
          </Text>
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Blocks
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            {block}
          </Text>
        </Box>
      </Box>
      <Box d="flex" justifyContent="space-between" alignItems="center">
        <Box
          d="flex"
          alignItems="center"
          justifyContent="space-between"
          width="50%"
        >
          {[
            {
              value: state.stakedHOPRTokens,
              currency: 'xHOPR',
              label: 'Staked',
            },
            {
              value: state.alreadyClaimedRewards,
              currency: 'wxHOPR',
              label: 'Claimed',
            },
          ].map((item) => {
            return (
              <Box d="flex" key={item.currency}>
                <Text fontWeight="600" fontSize="md" mr="5px">
                  {item.label}
                </Text>
                <BalanceWithCurrency
                  balanceElement={
                    <Skeleton isLoaded={false} mr="5px">
                      <Tag colorScheme="gray" fontFamily="mono">
                        {item.value || '--'}
                      </Tag>
                    </Skeleton>
                  }
                  currencyElement={<CurrencyTag tag={item.currency} />}
                />
              </Box>
            )
          })}
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Rewards (wxHOPR/sec)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            +{(baseBoost * +state.stakedHOPRTokens).toFixed(10)} (Base)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono" color="green.600">
            +{(bonusBoost * +state.stakedHOPRTokens).toFixed(10)} (Boost)
          </Text>
        </Box>
      </Box>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="10px"
      >
        <InputGroup size="md">
          <Input
            pr="10.5rem"
            type={'number'}
            placeholder="Enter amount"
            onChange={(e) => {
              dispatch({
                type: 'SET_STAKING_AMOUNT',
                amountValue: e.target.value,
              })
            }}
          />
          {account && (
            <InputRightElement width="10.5rem">
              <Button
                width="10rem"
                size="sm"
                isLoading={state.isLoading}
                onClick={() => {
                  setStaking(
                    XHOPRContractAddress,
                    HoprStakeContractAddress,
                    state,
                    library,
                    dispatch
                  )
                }}
                {...colours}
              >
                {state.isLoading ? 'Loading...' : 'Stake xHOPR tokens'}
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
      </Box>
      <Box
        mt="20px"
        d="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Box d="flex">
            <Text fontSize="sm" fontFamily="mono">
              Last time synced:{' '}
            </Text>
            <Skeleton isLoaded={false} mr="5px" minW="100px">
              {state.lastSync
                ? state.lastSync == '0'
                  ? 'Never'
                  : new Date(+state.lastSync * 1000).toUTCString()
                : '--'}
              {+state.lastSync > 0 && `(${format(+state.lastSync * 1000)})`}
            </Skeleton>
          </Box>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Claimable -
            </Text>
            <BalanceWithCurrency
              balanceElement={
                <Skeleton isLoaded={false} mr="5px">
                  <Tag colorScheme="gray" fontFamily="mono">
                    {state.yetToClaimRewards || '--'}
                  </Tag>
                </Skeleton>
              }
              currencyElement={<CurrencyTag tag={'wxHOPR'} />}
            />
            <Text ml="6px" fontSize="sm" fontFamily="mono" color="blue.600">
              + {estimatedRewards.toFixed(18)} (Estimated)
            </Text>
          </Box>
        </Box>
        {account && (
          <Box textAlign="right">
            <SyncButton
              isLoading={state.isLoadingSync}
              syncHandler={() => {
                setSync(HoprStakeContractAddress, state, library, dispatch)
              }}
            />
            <Button
              size="md"
              ml="10px"
              bg="blackAlpha.900"
              color="whiteAlpha.900"
              isDisabled={true}
            >
              Unlock (
              <EndProgramDateDays
                HoprStakeContractAddress={HoprStakeContractAddress}
              />{' '}
              to go)
            </Button>
            <Button
              size="md"
              ml="10px"
              bg="blackAlpha.900"
              color="whiteAlpha.900"
              isDisabled={true}
            >
              Claim Rewards
            </Button>
          </Box>
        )}
      </Box>
    </>
  )
}
