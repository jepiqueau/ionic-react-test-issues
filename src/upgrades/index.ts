import { BlobUpgrade } from './blob.upgrade';
import { CommentUpgrade } from './comment.upgrade';
import { ReturningUpgrade } from './returning.upgrade';
import { TransactionUpgrade } from './transaction.upgrade';
import { MultiplerowsUpgrade } from './multiplerows.upgrade';
import { ExecuteSetUpgrade } from './executeset.upgrade';
import { Issue558Upgrade } from './issue558.upgrade';
import { Issue561Upgrade } from './issue561.upgrade';
import { Issue562Upgrade } from './issue562.upgrade';

export const upgrades = [BlobUpgrade, CommentUpgrade, ReturningUpgrade, TransactionUpgrade,
    MultiplerowsUpgrade, ExecuteSetUpgrade, Issue558Upgrade, Issue561Upgrade, Issue562Upgrade];
export const databases = ['blob','comment', 'returning', 'transaction','multiplerows','executeset',
                          'issue558','issue561','issue562'];