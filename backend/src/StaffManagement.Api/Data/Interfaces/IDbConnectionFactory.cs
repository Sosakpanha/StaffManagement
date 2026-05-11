using System.Data.Common;

namespace StaffManagement.Api.Data.Interfaces;

/// <summary>
/// Opens a database connection for repositories to use. Returning the
/// abstract <see cref="DbConnection"/> keeps repositories driver-agnostic
/// and lets the factory be mocked in unit tests.
/// </summary>
public interface IDbConnectionFactory
{
	Task<DbConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default);
}
